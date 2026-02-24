import type { EventType } from "../schema.js";
import { handlePartReceived } from "./part-received.js";
import { handlePartUsed } from "./part-used.js";
import { createEventLog } from "../storage.js";

type HandlerFn = (eventId: number, payload: any) => Promise<void>;

const handlers: Record<string, HandlerFn> = {
  PART_RECEIVED: handlePartReceived,
  PART_USED: handlePartUsed,
};

export async function dispatchEvent(
  eventId: number,
  eventType: string,
  payload: any
): Promise<boolean> {
  const handler = handlers[eventType];

  if (!handler) {
    console.log(`[DISPATCH] No handler registered for event type: ${eventType}`);
    await createEventLog(
      eventId,
      "SKIPPED",
      `No handler registered for event type: ${eventType}. Event logged for future processing.`
    );
    return false;
  }

  console.log(`[DISPATCH] Routing event #${eventId} (${eventType}) to handler`);
  await handler(eventId, payload);
  return true;
}

export function getSupportedEventTypes(): string[] {
  return Object.keys(handlers);
}
