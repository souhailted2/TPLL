import type { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-api-key"] as string;
  const validKey = process.env.INTEGRATION_API_KEY;

  if (!validKey) {
    console.error("[AUTH] INTEGRATION_API_KEY not configured");
    res.status(500).json({ error: "Integration service not properly configured" });
    return;
  }

  if (!apiKey) {
    res.status(401).json({ error: "Missing X-API-Key header" });
    return;
  }

  if (apiKey !== validKey) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  next();
}
