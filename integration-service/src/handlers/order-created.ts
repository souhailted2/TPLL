import { createEventLog } from "../storage.js";

interface OrderCreatedPayload {
  orderId: number;
  salesPointId: string;
  salesPointName?: string;
  itemCount: number;
  items: Array<{
    productId: number;
    quantity: number;
    unit: string;
  }>;
  status: string;
}

export async function handleOrderCreated(
  eventId: number,
  payload: Partial<OrderCreatedPayload>
): Promise<void> {
  const orderId = payload.orderId ?? 0;
  const salesPointId = payload.salesPointId ?? "unknown";
  const salesPointName = payload.salesPointName;
  const items = payload.items ?? [];
  const itemCount = payload.itemCount ?? items.length;
  const status = payload.status ?? "submitted";

  console.log(`[HANDLER:ORDER_CREATED] Processing event #${eventId}`);
  console.log(`  Order #${orderId} from ${salesPointName ?? salesPointId}, ${itemCount} items, status: ${status}`);

  await createEventLog(eventId, "RECEIVED", `Order #${orderId} created by ${salesPointName ?? salesPointId} with ${itemCount} items`);

  console.log(`[OUTBOUND] → Finance System: POST /api/orders/cost-calculation`);
  console.log(`  Would send: { orderId: ${orderId}, items: ${JSON.stringify(items)} }`);
  await createEventLog(
    eventId,
    "NOTIFY_FINANCE",
    `[SIMULATED] HTTP POST to Finance System - Calculate cost for order #${orderId} with ${itemCount} items`
  );

  console.log(`[OUTBOUND] → Warehouse System: POST /api/warehouse/prepare`);
  console.log(`  Would send: { orderId: ${orderId}, items: ${JSON.stringify(items)}, priority: "normal" }`);
  await createEventLog(
    eventId,
    "NOTIFY_WAREHOUSE",
    `[SIMULATED] HTTP POST to Warehouse System - Prepare ${itemCount} items for order #${orderId}`
  );

  if (items && items.length > 0) {
    for (const item of items) {
      console.log(`[OUTBOUND] → Inventory System: POST /api/inventory/reserve`);
      console.log(`  Would send: { productId: ${item.productId}, quantity: ${item.quantity}, orderId: ${orderId} }`);
    }
    await createEventLog(
      eventId,
      "NOTIFY_INVENTORY",
      `[SIMULATED] HTTP POST to Inventory System - Reserve stock for ${items.length} products in order #${orderId}`
    );
  }

  await createEventLog(eventId, "COMPLETED", `Order created event fully processed for order #${orderId}`);
  console.log(`[HANDLER:ORDER_CREATED] Event #${eventId} processed successfully`);
}
