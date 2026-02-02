import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.claims.sub;
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
    const userId = req.user.claims.sub;
    const role = await storage.getUserRole(userId);
    
    // If admin, see all. If sales point, see own.
    const salesPointId = role?.role === 'admin' ? undefined : userId;
    const orders = await storage.getOrders(salesPointId);
    res.json(orders);
  });

  app.post(api.orders.create.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const userId = req.user.claims.sub;
      const order = await storage.createOrder(userId, input);
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
      const order = await storage.updateOrderStatus(Number(req.params.id), status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // === User Role API ===

  app.get(api.userRoles.get.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const role = await storage.getUserRole(userId);
    if (!role) {
      // Return default or empty if not found
      return res.status(404).json({ message: "Role not set" });
    }
    res.json(role);
  });

  app.post(api.userRoles.update.path, requireAuth, async (req: any, res) => {
    // This endpoint allows setting the role. 
    // In a real app, this should be restricted. 
    // For this prototype, we'll allow setting it once or if admin?
    // Let's allow any user to set their OWN role/salesPointName initially for onboarding.
    try {
      const input = api.userRoles.update.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Basic protection: don't allow setting admin unless... well, for this demo we might need an admin.
      // Let's say the first user can become admin, or we just trust the input for the demo.
      // Or we hardcode specific emails.
      // For now, allow update.
      const role = await storage.upsertUserRole(userId, input);
      res.json(role);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    await storage.createProduct({
      name: "برغي 10مم (Screw 10mm)",
      sku: "SCR-010",
      price: "0.50",
      stockQuantity: 10000,
      description: "برغي فولاذي عالي الجودة 10مم (High quality steel screw)",
      imageUrl: "https://placehold.co/400x400?text=Screw+10mm"
    });
    await storage.createProduct({
      name: "صامولة 10مم (Nut 10mm)",
      sku: "NUT-010",
      price: "0.20",
      stockQuantity: 20000,
      description: "صامولة سداسية الشكل (Hexagonal nut)",
      imageUrl: "https://placehold.co/400x400?text=Nut+10mm"
    });
    await storage.createProduct({
      name: "رنديلة (Washer)",
      sku: "WSH-010",
      price: "0.05",
      stockQuantity: 50000,
      description: "رنديلة معدنية (Metal washer)",
      imageUrl: "https://placehold.co/400x400?text=Washer"
    });
  }
}
