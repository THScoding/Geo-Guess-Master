import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, locationsTable, gamesTable, gameRoundsTable } from "@workspace/db";
import {
  CreateGameBody,
  GetGameParams,
  GetGameResponse,
  SubmitGuessParams,
  SubmitGuessBody,
  SubmitGuessResponse,
  GetGameResultsParams,
  GetGameResultsResponse,
} from "@workspace/api-zod";
import { haversineDistanceKm, calculateScore } from "../lib/scoring";

const router: IRouter = Router();

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

router.post("/games", async (req, res): Promise<void> => {
  const parsed = CreateGameBody.safeParse(req.body);
  const rounds = parsed.success && parsed.data.rounds ? parsed.data.rounds : 5;

  const allLocations = await db.select({ id: locationsTable.id }).from(locationsTable);
  if (allLocations.length < rounds) {
    res.status(400).json({ error: `Not enough locations. Need ${rounds}, have ${allLocations.length}.` });
    return;
  }

  const shuffled = shuffleArray(allLocations).slice(0, rounds);
  const locationOrder = shuffled.map((l) => l.id).join(",");

  const [game] = await db.insert(gamesTable).values({
    rounds,
    currentRound: 1,
    totalScore: 0,
    status: "in_progress",
    locationOrder,
  }).returning();

  const firstLocationId = shuffled[0].id;
  const [firstLocation] = await db.select().from(locationsTable).where(eq(locationsTable.id, firstLocationId));

  res.status(201).json(GetGameResponse.parse({
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    totalScore: game.totalScore,
    status: game.status,
    currentPhotoUrl: firstLocation?.imageUrl ?? null,
    currentLocationName: null,
  }));
});

router.get("/games/:id", async (req, res): Promise<void> => {
  const params = GetGameParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const locationIds = game.locationOrder.split(",").map(Number);
  const roundIndex = game.currentRound - 1;
  const currentLocationId = game.status === "finished" ? null : locationIds[roundIndex];

  let currentPhotoUrl: string | null = null;
  if (currentLocationId) {
    const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, currentLocationId));
    currentPhotoUrl = loc?.imageUrl ?? null;
  }

  res.json(GetGameResponse.parse({
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    totalScore: game.totalScore,
    status: game.status,
    currentPhotoUrl,
    currentLocationName: null,
  }));
});

router.post("/games/:id/guess", async (req, res): Promise<void> => {
  const params = SubmitGuessParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitGuessBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  if (game.status === "finished") {
    res.status(400).json({ error: "Game already finished" });
    return;
  }

  const locationIds = game.locationOrder.split(",").map(Number);
  const roundIndex = game.currentRound - 1;
  const currentLocationId = locationIds[roundIndex];

  const [location] = await db.select().from(locationsTable).where(eq(locationsTable.id, currentLocationId));
  if (!location) {
    res.status(400).json({ error: "Location not found for current round" });
    return;
  }

  const { lat: guessLat, lng: guessLng } = body.data;
  const distanceKm = haversineDistanceKm(guessLat, guessLng, location.lat, location.lng);
  const score = calculateScore(distanceKm);

  await db.insert(gameRoundsTable).values({
    gameId: game.id,
    locationId: location.id,
    round: game.currentRound,
    guessLat,
    guessLng,
    distanceKm,
    score,
  });

  const newTotalScore = game.totalScore + score;
  const isLastRound = game.currentRound >= game.rounds;
  const newStatus = isLastRound ? "finished" : "in_progress";
  const newCurrentRound = isLastRound ? game.currentRound : game.currentRound + 1;

  await db.update(gamesTable).set({
    totalScore: newTotalScore,
    currentRound: newCurrentRound,
    status: newStatus,
  }).where(eq(gamesTable.id, game.id));

  res.json(SubmitGuessResponse.parse({
    distanceKm: Math.round(distanceKm * 10) / 10,
    score,
    correctLat: location.lat,
    correctLng: location.lng,
    correctName: location.name,
    correctImageUrl: location.imageUrl,
    totalScore: newTotalScore,
    roundComplete: true,
    gameComplete: isLastRound,
  }));
});

router.get("/games/:id/results", async (req, res): Promise<void> => {
  const params = GetGameResultsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [game] = await db.select().from(gamesTable).where(eq(gamesTable.id, params.data.id));
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }

  const rounds = await db
    .select()
    .from(gameRoundsTable)
    .where(eq(gameRoundsTable.gameId, game.id))
    .orderBy(gameRoundsTable.round);

  const locationIds = rounds.map((r) => r.locationId);
  const locations = locationIds.length > 0
    ? await db.select().from(locationsTable).where(inArray(locationsTable.id, locationIds))
    : [];
  const locMap = new Map(locations.map((l) => [l.id, l]));

  const roundResults = rounds.map((r) => {
    const loc = locMap.get(r.locationId);
    return {
      round: r.round,
      locationName: loc?.name ?? "Unknown",
      guessLat: r.guessLat,
      guessLng: r.guessLng,
      correctLat: loc?.lat ?? 0,
      correctLng: loc?.lng ?? 0,
      distanceKm: Math.round(r.distanceKm * 10) / 10,
      score: r.score,
    };
  });

  res.json(GetGameResultsResponse.parse({
    id: game.id,
    totalScore: game.totalScore,
    rounds: game.rounds,
    roundResults,
  }));
});

export default router;
