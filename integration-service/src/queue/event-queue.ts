import { dispatchEvent } from "../handlers/index.js";
import { updateEventStatus, incrementRetryCount, createEventLog } from "../storage.js";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 10000];

interface QueueItem {
  eventId: number;
  eventType: string;
  payload: any;
  retryCount: number;
}

const queue: QueueItem[] = [];
let processing = false;

export function enqueueEvent(item: QueueItem): void {
  queue.push(item);
  console.log(`[QUEUE] Event #${item.eventId} enqueued. Queue size: ${queue.length}`);
  processNext();
}

async function processNext(): Promise<void> {
  if (processing || queue.length === 0) return;

  processing = true;
  const item = queue.shift()!;

  try {
    console.log(`[QUEUE] Processing event #${item.eventId} (${item.eventType})`);
    await updateEventStatus(item.eventId, "processing");
    await createEventLog(item.eventId, "PROCESSING", "Event picked up from queue");

    const wasHandled = await dispatchEvent(item.eventId, item.eventType, item.payload);

    await updateEventStatus(item.eventId, wasHandled ? "processed" : "skipped");
    console.log(`[QUEUE] Event #${item.eventId} processed successfully`);
  } catch (error: any) {
    const errorMessage = error.message ?? String(error);
    console.error(`[QUEUE] Event #${item.eventId} failed: ${errorMessage}`);

    if (item.retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[item.retryCount] ?? 10000;
      await incrementRetryCount(item.eventId);
      await createEventLog(
        item.eventId,
        "RETRY_SCHEDULED",
        `Retry ${item.retryCount + 1}/${MAX_RETRIES} scheduled in ${delay}ms. Error: ${errorMessage}`
      );

      setTimeout(() => {
        enqueueEvent({ ...item, retryCount: item.retryCount + 1 });
      }, delay);
    } else {
      await updateEventStatus(item.eventId, "failed", errorMessage);
      await createEventLog(
        item.eventId,
        "FAILED",
        `Max retries (${MAX_RETRIES}) exceeded. Error: ${errorMessage}`
      );
      console.error(`[QUEUE] Event #${item.eventId} permanently failed after ${MAX_RETRIES} retries`);
    }
  } finally {
    processing = false;
    if (queue.length > 0) {
      processNext();
    }
  }
}

export function getQueueSize(): number {
  return queue.length;
}
