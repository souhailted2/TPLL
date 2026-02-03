import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, isAuthenticated, seedUsers } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
    const products = await storage.getProducts();
    res.json(products);
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

  // Seed Data and Users
  await seedDatabase();
  await seedUsers();

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      name: "Boulon M10 (Brut)",
      sku: "BLT-M10-BRT",
      description: "Boulon en acier sans revêtement (Brut)",
      imageUrl: "https://placehold.co/400x400?text=Boulon+Brut"
    });
    await storage.createProduct({
      name: "Boulon M10 (Zingue a froid)",
      sku: "BLT-M10-ZAF",
      description: "Boulon avec zingage électrolytique (à froid)",
      imageUrl: "https://placehold.co/400x400?text=Zingue+Froid"
    });
    await storage.createProduct({
      name: "Boulon M10 (Zingue a chaud)",
      sku: "BLT-M10-ZAC",
      description: "Boulon avec galvanisation à chaud (au trempé)",
      imageUrl: "https://placehold.co/400x400?text=Zingue+Chaud"
    });
    await storage.createProduct({
      name: "صامولة 10مم (Nut 10mm)",
      sku: "NUT-010",
      description: "صامولة سداسية الشكل (Hexagonal nut)",
      imageUrl: "https://placehold.co/400x400?text=Nut+10mm"
    });
    await storage.createProduct({
      name: "رنديلة (Washer)",
      sku: "WSH-010",
      description: "رنديلة معدنية (Metal washer)",
      imageUrl: "https://placehold.co/400x400?text=Washer"
    });
  }
}
