const INTEGRATION_SERVICE_URL = process.env.INTEGRATION_SERVICE_URL || "http://localhost:3001";
const INTEGRATION_API_KEY = process.env.INTEGRATION_API_KEY || "";

export async function sendIntegrationEvent(
  type: string,
  source: string,
  payload: Record<string, any>,
  idempotencyKey?: string
): Promise<void> {
  if (!INTEGRATION_API_KEY) {
    console.warn("[Integration] INTEGRATION_API_KEY not set — skipping event dispatch");
    return;
  }

  try {
    const body: Record<string, any> = { type, source, payload };
    if (idempotencyKey) body.idempotencyKey = idempotencyKey;

    const response = await fetch(`${INTEGRATION_SERVICE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": INTEGRATION_API_KEY,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Integration] Event ${type} sent successfully — eventId: ${data.eventId}`);
    } else {
      const text = await response.text();
      console.warn(`[Integration] Event ${type} failed (${response.status}): ${text}`);
    }
  } catch (err: any) {
    console.warn(`[Integration] Failed to send event ${type}: ${err.message}`);
  }
}
