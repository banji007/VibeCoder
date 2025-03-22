import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRatingSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      secret: "vibe-coding-secret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // set to true if using HTTPS
    })
  );

  app.get("/api/ratings/stats", async (_req, res) => {
    const stats = await storage.getRatingStats();
    res.json(stats);
  });

  app.get("/api/ratings/user-status", async (req, res) => {
    const sessionId = req.sessionID;
    const hasRated = await storage.hasUserRated(sessionId);
    res.json({ hasRated });
  });

  app.post("/api/ratings", async (req, res) => {
    const sessionId = req.sessionID;
    const hasRated = await storage.hasUserRated(sessionId);

    if (hasRated) {
      return res.status(400).json({ message: "You have already submitted a rating" });
    }

    const result = insertRatingSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const rating = await storage.createRating(result.data, sessionId);
    const stats = await storage.getRatingStats();
    res.json({ rating, stats });
  });

  const httpServer = createServer(app);
  return httpServer;
}