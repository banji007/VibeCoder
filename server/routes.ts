import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRatingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/ratings/stats", async (_req, res) => {
    const stats = await storage.getRatingStats();
    res.json(stats);
  });

  app.post("/api/ratings", async (req, res) => {
    const result = insertRatingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const rating = await storage.createRating(result.data);
    const stats = await storage.getRatingStats();
    res.json({ rating, stats });
  });

  const httpServer = createServer(app);
  return httpServer;
}
