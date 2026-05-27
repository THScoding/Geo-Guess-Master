/**
 * Calculate Euclidean distance between two points on the 200x200 custom map grid.
 * Both axes run 0–200.
 * Returns distance in grid units (max diagonal ≈ 283).
 */
export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Score based on distance on the 200x200 grid.
 * - 0 units  → 5000 pts
 * - 20 units → ~2865 pts  (e.g. ~10% of the map width off)
 * - 60 units → ~940 pts
 * - 140+ units → ~0 pts
 */
export function calculateScore(distance: number): number {
  if (distance === 0) return 5000;
  const score = Math.round(5000 * Math.exp(-distance / 60));
  return Math.max(0, score);
}
