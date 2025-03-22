import { ratings, type Rating, type InsertRating } from "@shared/schema";

export interface IStorage {
  getRatings(): Promise<Rating[]>;
  createRating(rating: InsertRating, sessionId: string): Promise<Rating>;
  getRatingStats(): Promise<{ total: number; average: number }>;
  hasUserRated(sessionId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private ratings: Map<number, Rating>;
  currentId: number;

  constructor() {
    this.ratings = new Map();
    this.currentId = 1;
  }

  async getRatings(): Promise<Rating[]> {
    return Array.from(this.ratings.values());
  }

  async createRating(insertRating: InsertRating, sessionId: string): Promise<Rating> {
    const id = this.currentId++;
    const rating: Rating = { ...insertRating, id, sessionId };
    this.ratings.set(id, rating);
    return rating;
  }

  async getRatingStats(): Promise<{ total: number; average: number }> {
    const ratings = Array.from(this.ratings.values());
    const total = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
    return { total, average };
  }

  async hasUserRated(sessionId: string): Promise<boolean> {
    return Array.from(this.ratings.values()).some(
      (rating) => rating.sessionId === sessionId
    );
  }
}

export const storage = new MemStorage();