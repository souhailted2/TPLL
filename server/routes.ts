import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated, seedUsers } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { initializeFirebaseAdmin, sendPushToMultipleTokens } from "./firebase";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin();
  
  // Auth setup
  await setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.userId;
    const role = await storage.getUserRole(userId);
    if (role?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  };

  // === Products API (Admin only for mutations, Public/Auth for list?) ===
  // Let's make list public or auth required, but mutations admin only.
  
  app.get(api.products.list.path, requireAuth, async (req, res) => {
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const result = await storage.getProducts({ search, limit, offset });
    res.json(result);
  });

  app.get(api.products.get.path, requireAuth, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, requireAdmin, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, requireAdmin, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // === Orders API ===

  app.get(api.orders.list.path, requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    const role = await storage.getUserRole(userId);
    
    // If admin, see all. If sales point, see own.
    const salesPointId = role?.role === 'admin' ? undefined : userId;
    const orders = await storage.getOrders(salesPointId);
    res.json(orders);
  });

  app.post(api.orders.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.session.userId;
      const order = await storage.createOrder(userId, input);
      
      // Notify all admins about the new order
      const userRole = await storage.getUserRole(userId);
      const salesPointName = userRole?.salesPointName || "نقطة بيع";
      const adminIds = await storage.getAdminUserIds();
      
      for (const adminId of adminIds) {
        await storage.createNotification({
          userId: adminId,
          type: "new_order",
          title: "طلب جديد",
          message: `طلب جديد #${order.id} من ${salesPointName}`,
          orderId: order.id,
          isRead: false
        });
      }
      
      // Send push notifications to admins
      const adminTokens = await storage.getPushTokensByUserIds(adminIds);
      if (adminTokens.length > 0) {
        const tokens = adminTokens.map(t => t.token);
        const invalidTokens = await sendPushToMultipleTokens(
          tokens,
          "طلب جديد",
          `طلب جديد #${order.id} من ${salesPointName}`,
          { orderId: String(order.id), type: "new_order" }
        );
        // Remove invalid tokens
        for (const invalidToken of invalidTokens) {
          await storage.deletePushToken(invalidToken);
        }
      }
      
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch(api.orders.updateStatus.path, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const orderId = Number(req.params.id);
      
      // Get order details before update
      const existingOrder = await storage.getOrder(orderId);
      if (!existingOrder) return res.status(404).json({ message: "Order not found" });
      
      const order = await storage.updateOrderStatus(orderId, status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      // Notify the sales point about the status change
      const statusLabels: Record<string, string> = {
        submitted: "قيد الانتظار",
        processing: "قيد المعالجة",
        completed: "مكتمل",
        cancelled: "ملغي"
      };
      
      await storage.createNotification({
        userId: order.salesPointId,
        type: "status_change",
        title: "تحديث حالة الطلب",
        message: `تم تغيير حالة الطلب #${order.id} إلى: ${statusLabels[status] || status}`,
        orderId: order.id,
        isRead: false
      });
      
      // Send push notification to sales point
      const salesPointTokens = await storage.getPushTokens(order.salesPointId);
      if (salesPointTokens.length > 0) {
        const tokens = salesPointTokens.map(t => t.token);
        const invalidTokens = await sendPushToMultipleTokens(
          tokens,
          "تحديث حالة الطلب",
          `تم تغيير حالة الطلب #${order.id} إلى: ${statusLabels[status] || status}`,
          { orderId: String(order.id), type: "status_change" }
        );
        for (const invalidToken of invalidTokens) {
          await storage.deletePushToken(invalidToken);
        }
      }
      
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.post(api.import.products.path, requireAdmin, async (req, res) => {
    try {
      const items = api.import.products.input.parse(req.body);
      let count = 0;
      for (const item of items) {
        await storage.createProduct({
          name: item.name,
          sku: item.sku,
          finish: item.finish || "none",
          size: item.size || null,
          description: item.description || null,
          imageUrl: null
        });
        count++;
      }
      res.status(201).json({ count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to import products" });
    }
  });

  // === User Role API ===

  app.get(api.userRoles.get.path, requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    let role = await storage.getUserRole(userId);

    if (!role) {
      return res.status(404).json({ message: "Role not set" });
    }
    res.json(role);
  });

  app.post(api.userRoles.update.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.userRoles.update.input.parse(req.body);
      const userId = req.session.userId;
      const role = await storage.upsertUserRole(userId, input);
      res.json(role);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Notifications API ===
  
  app.get(api.notifications.list.path, requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    const userNotifications = await storage.getNotifications(userId);
    res.json(userNotifications);
  });

  app.patch(api.notifications.markRead.path, requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    const notification = await storage.markNotificationAsRead(Number(req.params.id), userId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  });

  app.post(api.notifications.markAllRead.path, requireAuth, async (req: any, res) => {
    const userId = req.session.userId;
    await storage.markAllNotificationsAsRead(userId);
    res.json({ success: true });
  });

  // === Push Token API ===
  
  app.post("/api/push-token", requireAuth, async (req: any, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const userId = req.session.userId;
      await storage.savePushToken(userId, token);
      res.json({ success: true });
    } catch (err) {
      console.error("Error saving push token:", err);
      res.status(500).json({ message: "Failed to save push token" });
    }
  });

  // Seed Users (must complete before server is ready)
  await seedUsers();
  
  // Seed Products in background (don't block server startup)
  seedDatabase().catch(err => console.error("Background seeding error:", err));

  return httpServer;
}

async function seedDatabase() {
  const { products: existingProducts } = await storage.getProducts();
  
  if (existingProducts.length < 1000) {
    console.log("Seeding products database with batch insert...");
    
    const lengths = [12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
    const finishes = [
      { code: "none", name: "Brut", suffix: "B" },
      { code: "cold", name: "Zingué", suffix: "Z" },
      { code: "hot", name: "Zingué à chaud", suffix: "ZC" },
      { code: "acier", name: "Acier", suffix: "A" },
    ];

    const existingSkus = new Set(existingProducts.map(p => p.sku));
    const allProducts: { name: string; sku: string; size: string; finish: string }[] = [];

    // Boulon Standard - 14 diameters × 28 lengths × 4 finishes = 1568
    const boulonDiameters = [4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30];
    for (const d of boulonDiameters) {
      for (const l of lengths) {
        for (const f of finishes) {
          const size = `${d}x${l}`;
          const sku = `B${f.suffix}${d}${l}`;
          if (!existingSkus.has(sku)) {
            allProducts.push({ name: `Boulon ${f.name} ${size}`, sku, size, finish: f.code });
          }
        }
      }
    }

    // Boulon Demi Filetage - 9 diameters × 28 lengths × 4 finishes = 1008
    const demiFiletageDiameters = [12, 14, 16, 18, 20, 22, 24, 27, 30];
    for (const d of demiFiletageDiameters) {
      for (const l of lengths) {
        for (const f of finishes) {
          const size = `${d}x${l}`;
          const sku = `BDF${f.suffix}${d}${l}`;
          if (!existingSkus.has(sku)) {
            allProducts.push({ name: `Boulon Demi Filetage ${f.name} ${size}`, sku, size, finish: f.code });
          }
        }
      }
    }

    // Boulon Poelier - smaller diameters (4-12) × 23 lengths × 4 finishes
    const poelierDiameters = [4, 5, 6, 8, 10, 12];
    const poelierLengths = [12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100, 110, 120, 130, 140, 150];
    for (const d of poelierDiameters) {
      for (const l of poelierLengths) {
        for (const f of finishes) {
          const size = `${d}x${l}`;
          const sku = `BP${f.suffix}${d}${l}`;
          if (!existingSkus.has(sku)) {
            allProducts.push({ name: `Boulon Poelier ${f.name} ${size}`, sku, size, finish: f.code });
          }
        }
      }
    }

    // Boulon Tête Fraisée - smaller diameters (4-12) × 23 lengths × 4 finishes
    for (const d of poelierDiameters) {
      for (const l of poelierLengths) {
        for (const f of finishes) {
          const size = `${d}x${l}`;
          const sku = `BTF${f.suffix}${d}${l}`;
          if (!existingSkus.has(sku)) {
            allProducts.push({ name: `Boulon Tête Fraisée ${f.name} ${size}`, sku, size, finish: f.code });
          }
        }
      }
    }

    // Rivet - 9 diameters × 28 lengths × 4 finishes = 1008
    const rivetDiameters = [12, 14, 16, 18, 20, 22, 24, 27, 30];
    for (const d of rivetDiameters) {
      for (const l of lengths) {
        for (const f of finishes) {
          const size = `${d}x${l}`;
          const sku = `R${f.suffix}${d}${l}`;
          if (!existingSkus.has(sku)) {
            allProducts.push({ name: `Rivet ${f.name} ${size}`, sku, size, finish: f.code });
          }
        }
      }
    }

    // Tige Filetée - 12 diameters × 4 finishes = 48
    const tigeDiameters = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30];
    for (const d of tigeDiameters) {
      for (const f of finishes) {
        const size = `${d}mm - 1m`;
        const sku = `TF${f.suffix}${d}`;
        if (!existingSkus.has(sku)) {
          allProducts.push({ name: `Tige Filetée ${f.name} ${size}`, sku, size, finish: f.code });
        }
      }
    }

    // Ecrou - 13 M sizes × 4 finishes = 52
    const ecrouSizes = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 36];
    for (const m of ecrouSizes) {
      for (const f of finishes) {
        const size = `M${m}`;
        const sku = `E${f.suffix}${m}`;
        if (!existingSkus.has(sku)) {
          allProducts.push({ name: `Ecrou ${f.name} ${size}`, sku, size, finish: f.code });
        }
      }
    }

    // Batch insert in chunks of 500
    const chunkSize = 500;
    for (let i = 0; i < allProducts.length; i += chunkSize) {
      const chunk = allProducts.slice(i, i + chunkSize);
      try {
        await (storage as any).createProductsBatch(chunk);
        console.log(`Inserted batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(allProducts.length / chunkSize)}`);
      } catch (err: any) {
        console.error(`Error inserting batch:`, err.message);
      }
    }

    console.log(`Added ${allProducts.length} new products to database.`);
  }
}
