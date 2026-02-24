import { pgTable, serial, text, jsonb, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const integrationEvents = pgTable("integration_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  source: text("source").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("pending"),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  retryCount: integer("retry_count").notNull().default(0),
  error: text("error"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrationEventLogs = pgTable("integration_event_logs", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => integrationEvents.id),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(integrationEvents).omit({
  id: true,
  status: true,
  retryCount: true,
  error: true,
  processedAt: true,
  createdAt: true,
});

export const insertEventLogSchema = createInsertSchema(integrationEventLogs).omit({
  id: true,
  createdAt: true,
});

export type IntegrationEvent = typeof integrationEvents.$inferSelect;
export type InsertIntegrationEvent = z.infer<typeof insertEventSchema>;
export type IntegrationEventLog = typeof integrationEventLogs.$inferSelect;
export type InsertIntegrationEventLog = z.infer<typeof insertEventLogSchema>;

export const EVENT_TYPES = [
  "PART_RECEIVED",
  "PART_USED",
  "PURCHASE_CREATED",
  "ORDER_CREATED",
  "CONTAINER_ARRIVED",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const eventPayloadSchema = z.object({
  type: z.enum(EVENT_TYPES),
  source: z.string().min(1),
  timestamp: z.string().optional(),
  idempotencyKey: z.string().optional(),
  payload: z.record(z.any()),
});

export type EventPayload = z.infer<typeof eventPayloadSchema>;
