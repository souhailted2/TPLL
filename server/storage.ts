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
  updateOrderItemStatus(itemId: number, itemStatus: string): Promise<OrderItem | undefined>;
  updateOrderItemCompletedQuantity(itemId: number, completedQuantity: number): Promise<OrderItem | undefined>;
  updateOrderItemShippedQuantity(itemId: number, shippedQuantity: number): Promise<OrderItem | undefined>;
  updateOrderItemReceivedQuantity(itemId: number, receivedQuantity: number): Promise<OrderItem | undefined>;
  adminCorrectItem(itemId: number, data: { completedQuantity?: number; shippedQuantity?: number; itemStatus?: string }): Promise<OrderItem | undefined>;
  syncOrderStatusFromItems(orderId: number): Promise<void>;
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
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        salesPointId,
        status: 'submitted'
      }).returning();

      console.log(`Creating order #${newOrder.id} with ${orderRequest.items.length} items`);

      for (const item of orderRequest.items) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit || 'piece'
        });
      }

      console.log(`Order #${newOrder.id} created successfully with ${orderRequest.items.length} items`);
      return newOrder;
    });
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

  async updateOrderItemStatus(itemId: number, itemStatus: string): Promise<OrderItem | undefined> {
    const [updated] = await db
      .update(orderItems)
      .set({ itemStatus })
      .where(eq(orderItems.id, itemId))
      .returning();
    return updated;
  }

  async syncOrderStatusFromItems(orderId: number): Promise<void> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    if (items.length === 0) return;

    const allAccepted = items.every(i => i.itemStatus === 'accepted' || i.itemStatus === 'in_progress' || i.itemStatus === 'completed');
    const allRejected = items.every(i => i.itemStatus === 'rejected');
    const anyInProgress = items.some(i => i.itemStatus === 'in_progress');
    const allCompleted = items.every(i => i.itemStatus === 'completed' || i.itemStatus === 'rejected');
    const anyAcceptedOrMore = items.some(i => ['accepted', 'in_progress', 'completed'].includes(i.itemStatus));

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order || order.status === 'shipped' || order.status === 'received') return;

    let newStatus = order.status;
    if (allRejected) {
      newStatus = 'rejected';
    } else if (allCompleted && anyAcceptedOrMore) {
      newStatus = 'completed';
    } else if (anyInProgress) {
      newStatus = 'in_progress';
    } else if (allAccepted || anyAcceptedOrMore) {
      newStatus = 'accepted';
    }

    if (newStatus !== order.status) {
      await db.update(orders).set({ status: newStatus, statusChangedAt: new Date() }).where(eq(orders.id, orderId));
    }
  }

  async updateOrderItemCompletedQuantity(itemId: number, completedQuantity: number): Promise<OrderItem | undefined> {
    const updateData: any = { completedQuantity, lastCompletedUpdate: new Date() };

    const [currentItem] = await db.select().from(orderItems).where(eq(orderItems.id, itemId));
    if (currentItem && completedQuantity >= currentItem.quantity) {
      updateData.itemStatus = 'completed';
    }

    const [updated] = await db
      .update(orderItems)
      .set(updateData)
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
      
      const nonRejectedItems = allItems.filter(item => item.itemStatus !== 'rejected');
      const allCompleted = nonRejectedItems.length > 0 && nonRejectedItems.every(item => item.completedQuantity >= item.quantity);
      if (allCompleted) {
        const [order] = await db.select().from(orders).where(eq(orders.id, updated.orderId));
        if (order && order.status !== 'shipped' && order.status !== 'received' && order.status !== 'completed') {
          await db
            .update(orders)
            .set({ status: 'completed', statusChangedAt: new Date() })
            .where(eq(orders.id, updated.orderId));
        }
      }
    }
    
    return updated;
  }

  async updateOrderItemShippedQuantity(itemId: number, shippedQuantity: number): Promise<OrderItem | undefined> {
    const [updated] = await db
      .update(orderItems)
      .set({ shippedQuantity })
      .where(eq(orderItems.id, itemId))
      .returning();

    if (updated) {
      const allItems = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, updated.orderId));

      const allFullyShipped = allItems
        .filter(i => i.itemStatus !== 'rejected')
        .every(i => i.shippedQuantity >= i.completedQuantity && i.completedQuantity > 0);

      if (allFullyShipped) {
        const [order] = await db.select().from(orders).where(eq(orders.id, updated.orderId));
        if (order && order.status !== 'shipped' && order.status !== 'received') {
          await db
            .update(orders)
            .set({ status: 'shipped', statusChangedAt: new Date() })
            .where(eq(orders.id, updated.orderId));
        }
      }
    }

    return updated;
  }

  async adminCorrectItem(itemId: number, data: { completedQuantity?: number; shippedQuantity?: number; itemStatus?: string }): Promise<OrderItem | undefined> {
    const updateData: any = {};
    if (data.completedQuantity !== undefined) {
      updateData.completedQuantity = data.completedQuantity;
      updateData.lastCompletedUpdate = new Date();
    }
    if (data.shippedQuantity !== undefined) {
      updateData.shippedQuantity = data.shippedQuantity;
    }
    if (data.itemStatus !== undefined) {
      updateData.itemStatus = data.itemStatus;
    }

    if (Object.keys(updateData).length === 0) return undefined;

    const [updated] = await db
      .update(orderItems)
      .set(updateData)
      .where(eq(orderItems.id, itemId))
      .returning();

    if (updated) {
      await this.syncOrderStatusFromItems(updated.orderId);
    }

    return updated;
  }

  async updateOrderItemReceivedQuantity(itemId: number, receivedQuantity: number): Promise<OrderItem | undefined> {
    const [updated] = await db
      .update(orderItems)
      .set({ receivedQuantity, itemStatus: 'received' })
      .where(eq(orderItems.id, itemId))
      .returning();

    if (updated) {
      const allItems = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, updated.orderId));

      const allReceived = allItems
        .filter(i => i.itemStatus !== 'rejected')
        .every(i => i.itemStatus === 'received');

      if (allReceived) {
        await db
          .update(orders)
          .set({ status: 'received', statusChangedAt: new Date() })
          .where(eq(orders.id, updated.orderId));
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
