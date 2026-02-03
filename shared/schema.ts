import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  finish: text("finish").notNull().default("none"), // none (brut), cold (zingue a froid), hot (zingue a chaud)
  description: text("description"),
  imageUrl: text("image_url"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  salesPointId: varchar("sales_point_id").notNull().references(() => users.id),
  status: text("status").notNull().default("submitted"), // submitted, processing, completed, cancelled
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time", { precision: 10, scale: 2 }).notNull(), // Price snapshot
});

// === RELATIONS ===

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  salesPoint: one(users, {
    fields: [orders.salesPointId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, totalAmount: true }); // Total calculated server-side
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, orderId: true, priceAtTime: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// Request types
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;

export type CreateOrderItemRequest = z.infer<typeof insertOrderItemSchema>;

export type CreateOrderRequest = {
  items: CreateOrderItemRequest[];
};

export type UpdateOrderStatusRequest = {
  status: string;
};

// Response types
export type ProductResponse = Product;
export type OrderItemResponse = OrderItem & { product?: Product };
export type OrderResponse = Order & { items?: OrderItemResponse[], salesPoint?: typeof users.$inferSelect };

// Extended User Type for Role Management (Assuming we store role in metadata or extra column if possible, but for now we'll infer or assume logic)
// Since we can't easily alter the auth table from here without migration conflict risk if not careful, 
// let's assume we might manage roles via a separate mechanism or just use email allowlists in logic, 
// BUT for a proper app, we should add a 'role' column to users.
// I will rely on the `shared/models/auth.ts` existing structure. 
// If I need to extend it, I should have done it in the `use_integration` step or modify it now.
// Let's check `shared/models/auth.ts` content again. It has basic fields.
// I will add `role` and `salesPointName` to `users` in `shared/models/auth.ts` via an edit if needed, 
// but `users` is imported. I can't redeclare it.
// I'll add a `user_profiles` table or just handle role logic in application code (e.g., admin email list).
// For simplicity in this "lite" build, I'll add a `user_roles` table.

export const userRoles = pgTable("user_roles", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  role: text("role").notNull().default("sales_point"), // 'admin', 'sales_point'
  salesPointName: text("sales_point_name"),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const insertUserRoleSchema = createInsertSchema(userRoles);
export type UserRole = typeof userRoles.$inferSelect;
export type UpdateUserRoleRequest = Partial<z.infer<typeof insertUserRoleSchema>>;

// === NOTIFICATIONS ===

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'new_order', 'status_change'
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

