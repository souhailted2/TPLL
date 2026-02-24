import { Router } from "express";
import { eventPayloadSchema, EVENT_TYPES } from "../schema.js";
import * as storage from "../storage.js";
import { enqueueEvent, getQueueSize } from "../queue/event-queue.js";
import { apiKeyAuth } from "../middleware/api-key-auth.js";

const router = Router();

router.post("/events", apiKeyAuth, async (req, res) => {
  try {
    const parsed = eventPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid event format",
        details: parsed.error.flatten(),
        expectedFormat: {
          type: `One of: ${EVENT_TYPES.join(", ")}`,
          source: "system-name (e.g., import-system)",
          timestamp: "ISO date string (optional)",
          idempotencyKey: "unique-key (optional, prevents duplicate processing)",
          payload: "{ ...event-specific data }",
        },
      });
      return;
    }

    const { type, source, timestamp, idempotencyKey, payload } = parsed.data;

    if (idempotencyKey) {
      const existing = await storage.checkIdempotency(idempotencyKey);
      if (existing) {
        console.log(`[EVENTS] Duplicate event detected (idempotencyKey: ${idempotencyKey})`);
        res.status(200).json({
          message: "Event already received",
          eventId: existing.id,
          status: existing.status,
          duplicate: true,
        });
        return;
      }
    }

    const event = await storage.createEvent({
      eventType: type,
      source,
      payload,
      idempotencyKey: idempotencyKey ?? null,
    });

    await storage.createEventLog(event.id, "RECEIVED", `Event received from ${source}`);

    enqueueEvent({
      eventId: event.id,
      eventType: type,
      payload,
      retryCount: 0,
    });

    console.log(`[EVENTS] Event #${event.id} (${type}) received from ${source}`);

    res.status(202).json({
      message: "Event accepted for processing",
      eventId: event.id,
      status: "pending",
    });
  } catch (error: any) {
    console.error("[EVENTS] Error receiving event:", error.message);
    res.status(500).json({ error: "Failed to process event" });
  }
});

router.get("/events", apiKeyAuth, async (req, res) => {
  try {
    const { type, source, status, limit, offset } = req.query;

    const events = await storage.getEvents({
      eventType: type as string,
      source: source as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({ events, count: events.length });
  } catch (error: any) {
    console.error("[EVENTS] Error fetching events:", error.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/events/:id", apiKeyAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const result = await storage.getEventById(id);
    if (!result.event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error("[EVENTS] Error fetching event:", error.message);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.get("/stats", apiKeyAuth, async (req, res) => {
  try {
    const stats = await storage.getEventStats();
    res.json({ ...stats, queueSize: getQueueSize() });
  } catch (error: any) {
    console.error("[EVENTS] Error fetching stats:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
