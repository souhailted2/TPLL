import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated, seedUsers } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { initializeFirebaseAdmin, sendPushToMultipleTokens } from "./firebase";
import { startAlertChecker } from "./alert-checker";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin();
  
  startAlertChecker();

  // Auth setup
  await setupAuth(app);

  app.get('/download/:filename', (req, res) => {
    const allowed = ['tpl-factory-hetzner.tar.gz', 'db_backup.sql'];
    const filename = req.params.filename;
    if (!allowed.includes(filename)) return res.status(404).send('Not found');
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const searchPaths = [
      path.resolve(process.cwd(), filename),
      path.resolve('/home/runner/workspace', filename),
      path.resolve(currentDir, '..', filename),
    ];
    const filePath = searchPaths.find(p => fs.existsSync(p));
    if (!filePath) return res.status(404).send('File not found');
    res.download(filePath, filename);
  });

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
    if (role?.role !== 'admin' && role?.role !== 'reception') {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  };

  const requireFactory = async (req: any, res: any, next: any) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.session.userId;
    const role = await storage.getUserRole(userId);
    if (!['admin', 'reception', 'shipping'].includes(role?.role || '')) {
      return res.status(403).json({ message: "Forbidden: Factory staff only" });
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

  app.get("/api/products/export", requireAdmin, async (req, res) => {
    const result = await storage.getProducts({ limit: 100000, offset: 0 });
    res.json(result.products);
  });

  app.get("/api/download/source", requireAdmin, async (req, res) => {
    try {
      const tmpFile = "/tmp/tpl-website-source.tar.gz";
      execSync(`tar czf ${tmpFile} --exclude=node_modules --exclude=.git --exclude=dist --exclude=.cache -C /home/runner/workspace .`);
      res.download(tmpFile, "tpl-website-source.tar.gz");
    } catch (err) {
      res.status(500).json({ message: "فشل في إنشاء ملف المصدر" });
    }
  });

  app.get("/api/download/database", requireAdmin, async (req, res) => {
    try {
      const tmpFile = "/tmp/tpl-database-backup.sql";
      execSync(`pg_dump $DATABASE_URL > ${tmpFile}`);
      res.download(tmpFile, "tpl-database-backup.sql");
    } catch (err) {
      res.status(500).json({ message: "فشل في تصدير قاعدة البيانات" });
    }
  });

  app.get(api.products.get.path, requireAuth, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, requireAuth, async (req, res) => {
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
    // All users see all orders
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.session.userId;
      const order = await storage.createOrder(userId, input);
      
      // Notify reception team and admins about the new order
      const userRole = await storage.getUserRole(userId);
      const salesPointName = userRole?.salesPointName || "نقطة بيع";
      const adminIds = await storage.getAdminUserIds();
      const receptionIds = await storage.getUserIdsByRole('reception');
      const notifyIds = Array.from(new Set([...adminIds, ...receptionIds]));
      
      for (const notifyId of notifyIds) {
        await storage.createNotification({
          userId: notifyId,
          type: "new_order",
          title: "طلب جديد",
          message: `طلب جديد #${order.id} من ${salesPointName}`,
          orderId: order.id,
          isRead: false
        });
      }
      
      // Send push notifications
      const notifyTokens = await storage.getPushTokensByUserIds(notifyIds);
      if (notifyTokens.length > 0) {
        const tokens = notifyTokens.map(t => t.token);
        const invalidTokens = await sendPushToMultipleTokens(
          tokens,
          "طلب جديد",
          `طلب جديد #${order.id} من ${salesPointName}`,
          { orderId: String(order.id), type: "new_order" }
        );
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

  app.patch(api.orders.updateStatus.path, requireAuth, async (req: any, res) => {
    try {
      const { status } = req.body;
      const orderId = Number(req.params.id);
      const userId = req.session.userId;
      const userRole = await storage.getUserRole(userId);
      const role = userRole?.role;
      
      // Get order details before update
      const existingOrder = await storage.getOrder(orderId);
      if (!existingOrder) return res.status(404).json({ message: "Order not found" });

      // Role-based status change validation
      const allowedTransitions: Record<string, Record<string, string[]>> = {
        reception: {
          submitted: ['accepted', 'rejected'],
          accepted: ['in_progress'],
          in_progress: ['completed'],
        },
        shipping: {
          completed: ['shipped'],
        },
        sales_point: {
          shipped: ['completed'],
        },
        admin: {
          submitted: ['accepted', 'rejected'],
          accepted: ['in_progress'],
          in_progress: ['completed'],
          completed: ['shipped'],
          shipped: ['completed'],
        },
      };

      const transitions = allowedTransitions[role || ''];
      if (!transitions) {
        return res.status(403).json({ message: "ليس لديك صلاحية لتغيير حالة الطلب" });
      }

      const allowed = transitions[existingOrder.status];
      if (!allowed || !allowed.includes(status)) {
        return res.status(400).json({ message: `لا يمكن تغيير الحالة من ${existingOrder.status} إلى ${status}` });
      }

      // For sales_point, verify they own the order
      if (role === 'sales_point' && existingOrder.salesPointId !== userId) {
        return res.status(403).json({ message: "لا يمكنك تعديل طلب ليس لك" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status, userId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const statusLabels: Record<string, string> = {
        submitted: "في الانتظار",
        accepted: "مقبول",
        rejected: "مرفوض",
        in_progress: "قيد الإنجاز",
        completed: "منجز",
        shipped: "تم الشحن",
        received: "تم الاستلام",
      };
      
      // Notify the sales point about status changes (except when sales_point changes their own)
      if (role !== 'sales_point') {
        await storage.createNotification({
          userId: order.salesPointId,
          type: "status_change",
          title: "تحديث حالة الطلب",
          message: `تم تغيير حالة الطلب #${order.id} إلى: ${statusLabels[status] || status}`,
          orderId: order.id,
          isRead: false
        });
        
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
      }

      // Notify shipping team when order is completed
      if (status === 'completed') {
        const shippingIds = await storage.getUserIdsByRole('shipping');
        for (const shippingId of shippingIds) {
          await storage.createNotification({
            userId: shippingId,
            type: "status_change",
            title: "طلب جاهز للشحن",
            message: `الطلب #${order.id} جاهز للشحن`,
            orderId: order.id,
            isRead: false
          });
        }
        const shippingTokens = await storage.getPushTokensByUserIds(shippingIds);
        if (shippingTokens.length > 0) {
          const tokens = shippingTokens.map(t => t.token);
          const invalidTokens = await sendPushToMultipleTokens(tokens, "طلب جاهز للشحن", `الطلب #${order.id} جاهز للشحن`, { orderId: String(order.id), type: "status_change" });
          for (const t of invalidTokens) await storage.deletePushToken(t);
        }
      }
      
      res.json(order);
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Update item status (reception team - per item accept/reject/in_progress/completed)
  app.patch("/api/order-items/:id/status", requireFactory, async (req: any, res) => {
    try {
      const itemId = Number(req.params.id);
      const { itemStatus } = req.body;
      const userId = req.session.userId;
      const userRole = await storage.getUserRole(userId);
      const role = userRole?.role;
      
      if (!['pending', 'accepted', 'rejected', 'in_progress', 'completed'].includes(itemStatus)) {
        return res.status(400).json({ message: "حالة غير صالحة" });
      }

      if (!['admin', 'reception'].includes(role || '')) {
        return res.status(403).json({ message: "ليس لديك صلاحية لتغيير حالة الصنف" });
      }

      const existingItem = await storage.getOrderItem(itemId);
      if (!existingItem) return res.status(404).json({ message: "Item not found" });
      
      const updated = await storage.updateOrderItemStatus(itemId, itemStatus);
      if (!updated) return res.status(404).json({ message: "Item not found" });

      // Auto-update order status based on item statuses
      await storage.syncOrderStatusFromItems(updated.orderId);
      
      res.json(updated);
    } catch (err) {
      console.error("Error updating item status:", err);
      res.status(500).json({ message: "Failed to update item status" });
    }
  });

  // Update completed quantity for order items (shipping team)
  app.patch("/api/order-items/:id/completed", requireFactory, async (req: any, res) => {
    try {
      const itemId = Number(req.params.id);
      const { completedQuantity } = req.body;
      const userId = req.session.userId;
      const userRole = await storage.getUserRole(userId);
      const role = userRole?.role;
      
      if (!['admin', 'shipping'].includes(role || '')) {
        return res.status(403).json({ message: "ليس لديك صلاحية لتعديل الكمية المستلمة" });
      }
      
      if (typeof completedQuantity !== 'number' || completedQuantity < 0) {
        return res.status(400).json({ message: "الكمية المستلمة غير صالحة" });
      }

      const existingItem = await storage.getOrderItem(itemId);
      if (!existingItem) return res.status(404).json({ message: "Item not found" });
      
      // Allow up to 150% of requested quantity
      const maxAllowed = Math.ceil(existingItem.quantity * 1.5);
      if (completedQuantity > maxAllowed) {
        return res.status(400).json({ message: `الكمية المستلمة لا يمكن أن تتجاوز ${maxAllowed} (150% من الكمية المطلوبة)` });
      }
      
      const updated = await storage.updateOrderItemCompletedQuantity(itemId, completedQuantity);
      if (!updated) return res.status(404).json({ message: "Item not found" });
      
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update completed quantity" });
    }
  });

  // Ship quantity for individual order item (shipping team)
  app.patch("/api/order-items/:id/ship", requireFactory, async (req: any, res) => {
    try {
      const itemId = Number(req.params.id);
      const { shippedQuantity } = req.body;
      const userId = req.session.userId;
      const userRole = await storage.getUserRole(userId);
      const role = userRole?.role;

      if (!['admin', 'shipping'].includes(role || '')) {
        return res.status(403).json({ message: "ليس لديك صلاحية لشحن الأصناف" });
      }

      if (typeof shippedQuantity !== 'number' || shippedQuantity < 0) {
        return res.status(400).json({ message: "كمية الشحن غير صالحة" });
      }

      const existingItem = await storage.getOrderItem(itemId);
      if (!existingItem) return res.status(404).json({ message: "الصنف غير موجود" });

      if (shippedQuantity > existingItem.completedQuantity) {
        return res.status(400).json({ message: `كمية الشحن لا يمكن أن تتجاوز الكمية المنجزة (${existingItem.completedQuantity})` });
      }

      const updated = await storage.updateOrderItemShippedQuantity(itemId, shippedQuantity);
      if (!updated) return res.status(404).json({ message: "الصنف غير موجود" });

      res.json(updated);
    } catch (err) {
      console.error("Error shipping item:", err);
      res.status(500).json({ message: "فشل شحن الصنف" });
    }
  });

  // Dismiss alert on an order
  app.patch("/api/orders/:id/dismiss-alert", requireAuth, async (req: any, res) => {
    try {
      const orderId = Number(req.params.id);
      const order = await storage.dismissOrderAlert(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to dismiss alert" });
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
