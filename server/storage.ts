import { db } from "./db";
import {
  products, orders, orderItems, userRoles, notifications,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Order, type CreateOrderRequest, type OrderItem,
  type UserRole, type UpdateUserRoleRequest,
  type Notification, type InsertNotification,
  users
} from "@shared/schema";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(options?: { search?: string; limit?: number; offset?: number }): Promise<{ products: Product[]; total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProductRequest): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(salesPointId?: string): Promise<(Order & { items: (OrderItem & { product: Product })[], salesPoint: any })[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(salesPointId: string, order: CreateOrderRequest): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // User Roles
  getUserRole(userId: string): Promise<UserRole | undefined>;
  upsertUserRole(userId: string, roleData: UpdateUserRoleRequest): Promise<UserRole>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getAdminUserIds(): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(options?: { search?: string; limit?: number; offset?: number }): Promise<{ products: Product[]; total: number }> {
    const { search, limit = 50, offset = 0 } = options || {};
    
    let baseQuery = db.select().from(products);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(products);
    
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      const searchCondition = or(
        ilike(products.name, searchPattern),
        ilike(products.sku, searchPattern)
      );
      // @ts-ignore
      baseQuery = baseQuery.where(searchCondition);
      // @ts-ignore
      countQuery = countQuery.where(searchCondition);
    }
    
    const [countResult] = await countQuery;
    const total = Number(countResult?.count || 0);
    
    // @ts-ignore
    const productList = await baseQuery.orderBy(products.name).limit(limit).offset(offset);
    
    return { products: productList, total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: UpdateProductRequest): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(salesPointId?: string): Promise<(Order & { items: (OrderItem & { product: Product })[], salesPoint: any })[]> {
    const baseQuery = db.select({
      order: orders,
      item: orderItems,
      product: products,
      salesPoint: users
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(users, eq(orders.salesPointId, users.id))
    .orderBy(desc(orders.createdAt));

    let rows;
    if (salesPointId) {
      rows = await baseQuery.where(eq(orders.salesPointId, salesPointId));
    } else {
      rows = await baseQuery;
    }
    
    // Group by order
    const result = new Map<number, Order & { items: (OrderItem & { product: Product })[], salesPoint: any }>();
    
    for (const row of rows) {
      if (!result.has(row.order.id)) {
        result.set(row.order.id, { ...row.order, items: [], salesPoint: row.salesPoint });
      }
      if (row.item && row.product) {
        result.get(row.order.id)!.items.push({ ...row.item, product: row.product });
      }
    }

    return Array.from(result.values());
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const rows = await db.select({
      order: orders,
      item: orderItems,
      product: products
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.id, id));

    if (rows.length === 0) return undefined;

    const order = rows[0].order;
    const items = rows
      .filter(row => row.item && row.product)
      .map(row => ({ ...row.item!, product: row.product! }));

    return { ...order, items };
  }

  async createOrder(salesPointId: string, orderRequest: CreateOrderRequest): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      salesPointId,
      status: 'submitted'
    }).returning();

    for (const item of orderRequest.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit || 'piece'
      });
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // User Roles
  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return role;
  }

  async upsertUserRole(userId: string, roleData: UpdateUserRoleRequest): Promise<UserRole> {
    const [role] = await db
      .insert(userRoles)
      .values({ userId, ...roleData })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: roleData,
      })
      .returning();
    return role;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number, userId: string): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async getAdminUserIds(): Promise<string[]> {
    const admins = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.role, 'admin'));
    return admins.map(a => a.userId);
  }
}

export const storage = new DatabaseStorage();
