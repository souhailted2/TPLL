import { db } from "./db.js";
import { integrationEvents, integrationEventLogs } from "./schema.js";
import type { InsertIntegrationEvent, IntegrationEvent, IntegrationEventLog } from "./schema.js";
import { eq, desc, and, sql } from "drizzle-orm";

export async function createEvent(data: InsertIntegrationEvent): Promise<IntegrationEvent> {
  const [event] = await db.insert(integrationEvents).values(data).returning();
  return event;
}

export async function getEvents(filters?: {
  eventType?: string;
  source?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<IntegrationEvent[]> {
  const conditions = [];
  if (filters?.eventType) conditions.push(eq(integrationEvents.eventType, filters.eventType));
  if (filters?.source) conditions.push(eq(integrationEvents.source, filters.source));
  if (filters?.status) conditions.push(eq(integrationEvents.status, filters.status));

  const query = db
    .select()
    .from(integrationEvents)
    .orderBy(desc(integrationEvents.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

export async function getEventById(id: number): Promise<{
  event: IntegrationEvent | null;
  logs: IntegrationEventLog[];
}> {
  const [event] = await db
    .select()
    .from(integrationEvents)
    .where(eq(integrationEvents.id, id))
    .limit(1);

  if (!event) return { event: null, logs: [] };

  const logs = await db
    .select()
    .from(integrationEventLogs)
    .where(eq(integrationEventLogs.eventId, id))
    .orderBy(desc(integrationEventLogs.createdAt));

  return { event, logs };
}

export async function updateEventStatus(
  id: number,
  status: string,
  error?: string
): Promise<void> {
  const updates: Record<string, any> = { status };
  if (status === "processed") updates.processedAt = new Date();
  if (error) updates.error = error;

  await db.update(integrationEvents).set(updates).where(eq(integrationEvents.id, id));
}

export async function incrementRetryCount(id: number): Promise<void> {
  await db
    .update(integrationEvents)
    .set({ retryCount: sql`${integrationEvents.retryCount} + 1` })
    .where(eq(integrationEvents.id, id));
}

export async function checkIdempotency(key: string): Promise<IntegrationEvent | null> {
  const [existing] = await db
    .select()
    .from(integrationEvents)
    .where(eq(integrationEvents.idempotencyKey, key))
    .limit(1);
  return existing ?? null;
}

export async function createEventLog(
  eventId: number,
  action: string,
  details?: string
): Promise<void> {
  await db.insert(integrationEventLogs).values({ eventId, action, details });
}

export async function getEventStats(): Promise<{
  total: number;
  pending: number;
  processing: number;
  processed: number;
  failed: number;
  byType: Record<string, number>;
}> {
  const statusCounts = await db
    .select({
      status: integrationEvents.status,
      count: sql<number>`count(*)::int`,
    })
    .from(integrationEvents)
    .groupBy(integrationEvents.status);

  const typeCounts = await db
    .select({
      eventType: integrationEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(integrationEvents)
    .groupBy(integrationEvents.eventType);

  const stats = { total: 0, pending: 0, processing: 0, processed: 0, failed: 0 };
  for (const row of statusCounts) {
    const key = row.status as keyof typeof stats;
    if (key in stats) stats[key] = row.count;
    stats.total += row.count;
  }

  const byType: Record<string, number> = {};
  for (const row of typeCounts) {
    byType[row.eventType] = row.count;
  }

  return { ...stats, byType };
}
