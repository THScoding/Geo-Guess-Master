import { pgTable, serial, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { gamesTable } from "./games";
import { locationsTable } from "./locations";

export const gameRoundsTable = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => gamesTable.id),
  locationId: integer("location_id").notNull().references(() => locationsTable.id),
  round: integer("round").notNull(),
  guessLat: doublePrecision("guess_lat").notNull(),
  guessLng: doublePrecision("guess_lng").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GameRound = typeof gameRoundsTable.$inferSelect;
