import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, locationsTable, gamesTable } from "@workspace/db";
import {
  ListLocationsResponse,
  CreateLocationBody,
  GetLocationParams,
  GetLocationResponse,
  UpdateLocationParams,
  UpdateLocationBody,
  UpdateLocationResponse,
  DeleteLocationParams,
  GetLocationStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/locations/stats", async (req, res): Promise<void> => {
  const [locCount] = await db.select({ count: count() }).from(locationsTable);
  const [gameCount] = await db.select({ count: count() }).from(gamesTable);

  const stats = GetLocationStatsResponse.parse({
    totalLocations: locCount.count,
    totalGames: gameCount.count,
    avgScore: 0,
  });
  res.json(stats);
});

router.get("/locations", async (_req, res): Promise<void> => {
  const locations = await db.select().from(locationsTable).orderBy(locationsTable.createdAt);
  res.json(ListLocationsResponse.parse(locations));
});

router.post("/locations", async (req, res): Promise<void> => {
  const parsed = CreateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [location] = await db.insert(locationsTable).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    imageUrl: parsed.data.imageUrl,
    hint: parsed.data.hint ?? null,
  }).returning();

  res.status(201).json(GetLocationResponse.parse(location));
});

router.get("/locations/:id", async (req, res): Promise<void> => {
  const params = GetLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [location] = await db.select().from(locationsTable).where(eq(locationsTable.id, params.data.id));
  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }

  res.json(GetLocationResponse.parse(location));
});

router.patch("/locations/:id", async (req, res): Promise<void> => {
  const params = UpdateLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.lat !== undefined) updateData.lat = parsed.data.lat;
  if (parsed.data.lng !== undefined) updateData.lng = parsed.data.lng;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
  if (parsed.data.hint !== undefined) updateData.hint = parsed.data.hint;

  const [location] = await db
    .update(locationsTable)
    .set(updateData)
    .where(eq(locationsTable.id, params.data.id))
    .returning();

  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }

  res.json(UpdateLocationResponse.parse(location));
});

router.delete("/locations/:id", async (req, res): Promise<void> => {
  const params = DeleteLocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [location] = await db
    .delete(locationsTable)
    .where(eq(locationsTable.id, params.data.id))
    .returning();

  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
