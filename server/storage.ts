import { db } from "./db";
import {
  products, orders, orderItems, userRoles, notifications,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Order, type CreateOrderRequest, type OrderItem,
  type UserRole, type UpdateUserRoleRequest,
  type Notification, type InsertNotification,
  users
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
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
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
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
    let query = db.select({
      order: orders,
      item: orderItems,
      product: products,
      salesPoint: users
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(users, eq(orders.salesPointId, users.id));

    if (salesPointId) {
      // @ts-ignore - complicated join typing
      query.where(eq(orders.salesPointId, salesPointId));
    }
    
    // @ts-ignore
    query.orderBy(desc(orders.createdAt));

    const rows = await query;
    
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
    // Calculate total amount and verify stock (optional, not strictly enforced yet)
    let totalAmount = 0;
    const itemsToInsert = [];

    for (const item of orderRequest.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      const price = Number(product.price);
      totalAmount += price * item.quantity;
      itemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price.toString()
      });
    }

    // Start transaction ideally, but for now sequential
    const [newOrder] = await db.insert(orders).values({
      salesPointId,
      totalAmount: totalAmount.toFixed(2),
      status: 'submitted'
    }).returning();

    for (const item of itemsToInsert) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        ...item
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
