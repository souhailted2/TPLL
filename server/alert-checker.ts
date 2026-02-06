import { db } from "./db";
import { orders, orderItems, products, userRoles, pushTokens } from "@shared/schema";
import { eq, and, inArray, isNotNull, sql } from "drizzle-orm";
import { sendPushToMultipleTokens } from "./firebase";

const ALERT_DAYS_THRESHOLD = 15;
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const ACTIVE_STATUSES = ["accepted", "in_progress", "completed"];

async function checkAndSendAlertNotifications() {
  try {
    const allOrders = await db
      .select({
        orderId: orders.id,
        status: orders.status,
        alertDismissed: orders.alertDismissed,
        alertNotificationSentAt: orders.alertNotificationSentAt,
        salesPointId: orders.salesPointId,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(
        and(
          inArray(orders.status, ACTIVE_STATUSES),
          eq(orders.alertDismissed, false)
        )
      );

    if (allOrders.length === 0) return;

    const now = new Date();
    const thresholdDate = new Date(now.getTime() - ALERT_DAYS_THRESHOLD * 24 * 60 * 60 * 1000);

    const alertOrderIds: number[] = [];

    for (const order of allOrders) {
      if (order.alertNotificationSentAt) {
        const timeSinceLastNotification = now.getTime() - new Date(order.alertNotificationSentAt).getTime();
        if (timeSinceLastNotification < NOTIFICATION_COOLDOWN_MS) {
          continue;
        }
      }

      const items = await db
        .select({
          quantity: orderItems.quantity,
          completedQuantity: orderItems.completedQuantity,
          lastCompletedUpdate: orderItems.lastCompletedUpdate,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.orderId));

      let hasAlert = false;
      for (const item of items) {
        if (item.completedQuantity === item.quantity) continue;

        const referenceDate = item.lastCompletedUpdate
          ? new Date(item.lastCompletedUpdate)
          : (order.createdAt ? new Date(order.createdAt) : null);

        if (!referenceDate) continue;
        if (referenceDate > thresholdDate) continue;

        hasAlert = true;
        break;
      }

      if (hasAlert) {
        alertOrderIds.push(order.orderId);
      }
    }

    if (alertOrderIds.length === 0) return;

    const receptionAndAdminUserIds = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(inArray(userRoles.role, ["admin", "reception"]));

    const userIds = receptionAndAdminUserIds.map(u => u.userId);
    if (userIds.length === 0) return;

    const tokens = await db
      .select({ token: pushTokens.token })
      .from(pushTokens)
      .where(sql`${pushTokens.userId} IN ${userIds}`);

    const tokenStrings = tokens.map(t => t.token);
    if (tokenStrings.length === 0) return;

    const title = "تنبيه طلبيات متأخرة";
    const body = alertOrderIds.length === 1
      ? `الطلب #${alertOrderIds[0]} لم يتم تحديثه منذ أكثر من ${ALERT_DAYS_THRESHOLD} يوم`
      : `${alertOrderIds.length} طلبيات لم يتم تحديثها منذ أكثر من ${ALERT_DAYS_THRESHOLD} يوم`;

    const invalidTokens = await sendPushToMultipleTokens(
      tokenStrings,
      title,
      body,
      { type: "alert_overdue", orderIds: alertOrderIds.join(",") }
    );

    for (const t of invalidTokens) {
      await db.delete(pushTokens).where(eq(pushTokens.token, t));
    }

    await db
      .update(orders)
      .set({ alertNotificationSentAt: now })
      .where(inArray(orders.id, alertOrderIds));

    console.log(`Alert notifications sent for ${alertOrderIds.length} orders to ${tokenStrings.length} devices`);
  } catch (error) {
    console.error("Error in alert checker:", error);
  }
}

let intervalId: NodeJS.Timeout | null = null;

export function startAlertChecker() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  console.log(`Alert checker started - checking every ${CHECK_INTERVAL_MS / 60000} minutes`);

  setTimeout(() => {
    checkAndSendAlertNotifications();
  }, 30000);

  intervalId = setInterval(checkAndSendAlertNotifications, CHECK_INTERVAL_MS);
}

export function stopAlertChecker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
