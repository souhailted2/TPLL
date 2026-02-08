import { db } from "./db";
import {
  products, orders, orderItems, userRoles, notifications, pushTokens,
  type Product, type InsertProduct, type UpdateProductRequest,
  type Order, type CreateOrderRequest, type OrderItem,
  type UserRole, type UpdateUserRoleRequest,
  type Notification, type InsertNotification,
  type PushToken, type InsertPushToken,
  users
} from "@shared/schema";
import { eq, desc, and, or, ilike, sql, aliasedTable } from "drizzle-orm";

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
  updateOrderStatus(id: number, status: string, changedByUserId?: string): Promise<Order | undefined>;
  getOrderItem(itemId: number): Promise<OrderItem | undefined>;
  updateOrderItemCompletedQuantity(itemId: number, completedQuantity: number): Promise<OrderItem | undefined>;
  dismissOrderAlert(orderId: number): Promise<Order | undefined>;

  // User Roles
  getUserRole(userId: string): Promise<UserRole | undefined>;
  upsertUserRole(userId: string, roleData: UpdateUserRoleRequest): Promise<UserRole>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getAdminUserIds(): Promise<string[]>;
  getUserIdsByRole(role: string): Promise<string[]>;

  // Push Tokens
  savePushToken(userId: string, token: string): Promise<PushToken>;
  getPushTokens(userId: string): Promise<PushToken[]>;
  getPushTokensByUserIds(userIds: string[]): Promise<PushToken[]>;
  deletePushToken(token: string): Promise<void>;
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
    
    // @ts-ignore - Sort by numeric values extracted from size (e.g., "10x12" -> 10, 12)
    // Handle different size formats: "10x12", "M6", "6mm - 1m"
    const productList = await baseQuery
      .orderBy(
        sql`CASE 
          WHEN ${products.size} ~ '^[0-9]+x[0-9]+$' THEN SPLIT_PART(${products.size}, 'x', 1)::int 
          WHEN ${products.size} ~ '^M[0-9]+$' THEN SUBSTRING(${products.size} FROM 2)::int
          WHEN ${products.size} ~ '^[0-9]+mm' THEN SPLIT_PART(${products.size}, 'mm', 1)::int
          ELSE 9999
        END`,
        sql`CASE 
          WHEN ${products.size} ~ '^[0-9]+x[0-9]+$' THEN SPLIT_PART(${products.size}, 'x', 2)::int 
          ELSE 0
        END`,
        products.name
      )
      .limit(limit).offset(offset);
    
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

  async createProductsBatch(productList: InsertProduct[]): Promise<void> {
    if (productList.length === 0) return;
    await db.insert(products).values(productList).onConflictDoNothing();
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
  async getOrders(salesPointId?: string): Promise<(Order & { items: (OrderItem & { product: Product })[], salesPoint: any, statusChanger?: any })[]> {
    const changerUsers = aliasedTable(users, 'changer_users');
    
    const baseQuery = db.select({
      order: orders,
      item: orderItems,
      product: products,
      salesPoint: users,
      salesPointRole: userRoles,
      statusChanger: changerUsers,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(users, eq(orders.salesPointId, users.id))
    .leftJoin(userRoles, eq(orders.salesPointId, userRoles.userId))
    .leftJoin(changerUsers, eq(orders.statusChangedBy, changerUsers.id))
    .orderBy(desc(orders.createdAt));

    let rows;
    if (salesPointId) {
      rows = await baseQuery.where(eq(orders.salesPointId, salesPointId));
    } else {
      rows = await baseQuery;
    }
    
    // Group by order
    const result = new Map<number, Order & { items: (OrderItem & { product: Product })[], salesPoint: any, statusChanger?: any }>();
    
    for (const row of rows) {
      if (!result.has(row.order.id)) {
        const sp = row.salesPoint ? { ...row.salesPoint, salesPointName: row.salesPointRole?.salesPointName } : null;
        const changer = row.statusChanger ? { firstName: row.statusChanger.firstName } : null;
        result.set(row.order.id, { ...row.order, items: [], salesPoint: sp, statusChanger: changer });
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

  async updateOrderStatus(id: number, status: string, changedByUserId?: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, statusChangedBy: changedByUserId || null, statusChangedAt: new Date() })
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

  async getOrderItem(itemId: number): Promise<OrderItem | undefined> {
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, itemId));
    return item;
  }

  async updateOrderItemCompletedQuantity(itemId: number, completedQuantity: number): Promise<OrderItem | undefined> {
    const [updated] = await db
      .update(orderItems)
      .set({ completedQuantity, lastCompletedUpdate: new Date() })
      .where(eq(orderItems.id, itemId))
      .returning();
    
    if (updated) {
      await db
        .update(orders)
        .set({ alertDismissed: false, alertNotificationSentAt: null })
        .where(eq(orders.id, updated.orderId));

      const allItems = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, updated.orderId));
      
      const allCompleted = allItems.every(item => item.completedQuantity >= item.quantity);
      if (allCompleted) {
        const [order] = await db.select().from(orders).where(eq(orders.id, updated.orderId));
        if (order && (order.status === 'in_progress' || order.status === 'accepted')) {
          await db
            .update(orders)
            .set({ status: 'completed', statusChangedAt: new Date() })
            .where(eq(orders.id, updated.orderId));
        }
      }
    }
    
    return updated;
  }

  async dismissOrderAlert(orderId: number): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ alertDismissed: true, alertDismissedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  async getAdminUserIds(): Promise<string[]> {
    const admins = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(or(eq(userRoles.role, 'admin'), eq(userRoles.role, 'reception')));
    return admins.map(a => a.userId);
  }

  async getUserIdsByRole(role: string): Promise<string[]> {
    const users = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.role, role));
    return users.map(u => u.userId);
  }

  // Push Tokens
  async savePushToken(userId: string, token: string): Promise<PushToken> {
    const existing = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.token, token))
      .limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(pushTokens)
        .set({ userId })
        .where(eq(pushTokens.token, token))
        .returning();
      return updated;
    }
    
    const [newToken] = await db.insert(pushTokens).values({ userId, token }).returning();
    return newToken;
  }

  async getPushTokens(userId: string): Promise<PushToken[]> {
    return db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
  }

  async getPushTokensByUserIds(userIds: string[]): Promise<PushToken[]> {
    if (userIds.length === 0) return [];
    
    const tokens = await db
      .select()
      .from(pushTokens)
      .where(sql`${pushTokens.userId} IN ${userIds}`);
    return tokens;
  }

  async deletePushToken(token: string): Promise<void> {
    await db.delete(pushTokens).where(eq(pushTokens.token, token));
  }
}

export const storage = new DatabaseStorage();
