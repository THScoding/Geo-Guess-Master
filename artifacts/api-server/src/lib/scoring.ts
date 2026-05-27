/**
 * Calculate Euclidean distance between two points on the custom image map.
 * Coordinates are percentages (0–100) of the image width/height.
 * Returns distance as a percentage of the image diagonal (0–100).
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
 * Calculate score based on distance on the custom image map.
 * Max score is 5000. Score decreases with distance.
 * - 0 units  → 5000 pts
 * - 20 units → ~2000 pts
 * - 80+ units → ~0 pts
 */
export function calculateScore(distance: number): number {
  if (distance === 0) return 5000;
  const score = Math.round(5000 * Math.exp(-distance / 30));
  return Math.max(0, score);
}
