import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamesTable = pgTable("games", {
  id: serial("id").primaryKey(),
  rounds: integer("rounds").notNull().default(5),
  currentRound: integer("current_round").notNull().default(1),
  totalScore: integer("total_score").notNull().default(0),
  status: text("status", { enum: ["in_progress", "finished"] }).notNull().default("in_progress"),
  locationOrder: text("location_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(gamesTable).omit({ id: true, createdAt: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
