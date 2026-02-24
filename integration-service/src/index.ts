import "dotenv/config";
import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/logger.js";
import eventsRouter from "./routes/events.js";

const app = express();
const PORT = parseInt(process.env.INTEGRATION_PORT || "3001", 10);

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "TPL Integration Service", uptime: process.uptime() });
});

app.use("/", eventsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  TPL Integration Service - Event-Driven Communication Layer");
  console.log(`  Running on port ${PORT}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  Endpoints:");
  console.log(`    POST   http://localhost:${PORT}/events       — Send an event`);
  console.log(`    GET    http://localhost:${PORT}/events       — List events`);
  console.log(`    GET    http://localhost:${PORT}/events/:id   — Get event details`);
  console.log(`    GET    http://localhost:${PORT}/stats        — Event statistics`);
  console.log(`    GET    http://localhost:${PORT}/health       — Health check`);
  console.log("");
  console.log("  Supported Event Types:");
  console.log("    PART_RECEIVED, PART_USED, PURCHASE_CREATED, ORDER_CREATED, CONTAINER_ARRIVED");
  console.log("");
  console.log("  Example — Send PART_RECEIVED event:");
  console.log(`    curl -X POST http://localhost:${PORT}/events \\`);
  console.log(`      -H "Content-Type: application/json" \\`);
  console.log(`      -H "X-API-Key: YOUR_API_KEY" \\`);
  console.log(`      -d '{`);
  console.log(`        "type": "PART_RECEIVED",`);
  console.log(`        "source": "import-system",`);
  console.log(`        "payload": {`);
  console.log(`          "partId": 22,`);
  console.log(`          "quantity": 500,`);
  console.log(`          "unitPrice": 1200,`);
  console.log(`          "containerId": "C102"`);
  console.log(`        }`);
  console.log(`      }'`);
  console.log("");
  console.log("  Example — Send PART_USED event:");
  console.log(`    curl -X POST http://localhost:${PORT}/events \\`);
  console.log(`      -H "Content-Type: application/json" \\`);
  console.log(`      -H "X-API-Key: YOUR_API_KEY" \\`);
  console.log(`      -d '{`);
  console.log(`        "type": "PART_USED",`);
  console.log(`        "source": "admin-system",`);
  console.log(`        "payload": {`);
  console.log(`          "partId": 22,`);
  console.log(`          "quantity": 5,`);
  console.log(`          "machineId": "M001",`);
  console.log(`          "reason": "maintenance"`);
  console.log(`        }`);
  console.log(`      }'`);
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
});
