import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
  sessionId: text("session_id").notNull(),
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  rating: true,
}).extend({
  rating: z.number().min(1).max(10)
});

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;