import { createEventLog } from "../storage.js";

interface PartReceivedPayload {
  partId: number;
  partName?: string;
  quantity: number;
  unitPrice?: number;
  containerId?: string;
  supplier?: string;
}

export async function handlePartReceived(
  eventId: number,
  payload: PartReceivedPayload
): Promise<void> {
  const { partId, partName, quantity, unitPrice, containerId, supplier } = payload;

  console.log(`[HANDLER:PART_RECEIVED] Processing event #${eventId}`);
  console.log(`  Part ID: ${partId}, Name: ${partName ?? "N/A"}, Qty: ${quantity}`);

  await createEventLog(eventId, "RECEIVED", `Part ${partId} received - quantity: ${quantity}`);

  console.log(`[OUTBOUND] → Finance System: POST /api/purchases`);
  console.log(`  Would send: { partId: ${partId}, quantity: ${quantity}, unitPrice: ${unitPrice ?? 0}, containerId: "${containerId ?? ""}" }`);
  await createEventLog(
    eventId,
    "NOTIFY_FINANCE",
    `[SIMULATED] HTTP POST to Finance System - Record purchase cost for part ${partId}, qty ${quantity}, unit price ${unitPrice ?? 0}`
  );

  console.log(`[OUTBOUND] → Inventory System: POST /api/inventory/increase`);
  console.log(`  Would send: { partId: ${partId}, quantity: ${quantity} }`);
  await createEventLog(
    eventId,
    "NOTIFY_INVENTORY",
    `[SIMULATED] HTTP POST to Inventory System - Increase stock for part ${partId} by ${quantity}`
  );

  if (containerId) {
    console.log(`[OUTBOUND] → Import System: PATCH /api/containers/${containerId}/status`);
    console.log(`  Would send: { status: "parts_received" }`);
    await createEventLog(
      eventId,
      "NOTIFY_IMPORT",
      `[SIMULATED] HTTP PATCH to Import System - Update container ${containerId} status`
    );
  }

  await createEventLog(eventId, "COMPLETED", `Part received event fully processed`);
  console.log(`[HANDLER:PART_RECEIVED] Event #${eventId} processed successfully`);
}
