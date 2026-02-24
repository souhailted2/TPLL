import { createEventLog } from "../storage.js";

interface PartUsedPayload {
  partId: number;
  partName?: string;
  quantity: number;
  machineId?: string;
  machineName?: string;
  usedBy?: string;
  reason?: string;
}

export async function handlePartUsed(
  eventId: number,
  payload: PartUsedPayload
): Promise<void> {
  const { partId, partName, quantity, machineId, machineName, usedBy, reason } = payload;

  console.log(`[HANDLER:PART_USED] Processing event #${eventId}`);
  console.log(`  Part ID: ${partId}, Name: ${partName ?? "N/A"}, Qty: ${quantity}, Machine: ${machineId ?? "N/A"}`);

  await createEventLog(eventId, "RECEIVED", `Part ${partId} used - quantity: ${quantity}`);

  console.log(`[OUTBOUND] → Inventory System: POST /api/inventory/decrease`);
  console.log(`  Would send: { partId: ${partId}, quantity: ${quantity} }`);
  await createEventLog(
    eventId,
    "NOTIFY_INVENTORY",
    `[SIMULATED] HTTP POST to Inventory System - Decrease stock for part ${partId} by ${quantity}`
  );

  console.log(`[OUTBOUND] → Finance System: POST /api/maintenance-costs`);
  console.log(`  Would send: { partId: ${partId}, quantity: ${quantity}, machineId: "${machineId ?? ""}", reason: "${reason ?? "maintenance"}" }`);
  await createEventLog(
    eventId,
    "NOTIFY_FINANCE",
    `[SIMULATED] HTTP POST to Finance System - Record maintenance cost for part ${partId}, qty ${quantity}, machine ${machineId ?? "N/A"}`
  );

  if (machineId) {
    console.log(`[OUTBOUND] → Admin System: PATCH /api/machines/${machineId}/maintenance`);
    console.log(`  Would send: { partId: ${partId}, quantity: ${quantity}, usedBy: "${usedBy ?? ""}" }`);
    await createEventLog(
      eventId,
      "NOTIFY_ADMIN",
      `[SIMULATED] HTTP PATCH to Admin System - Log maintenance for machine ${machineId}`
    );
  }

  await createEventLog(eventId, "COMPLETED", `Part used event fully processed`);
  console.log(`[HANDLER:PART_USED] Event #${eventId} processed successfully`);
}
