/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate score based on distance.
 * Max score is 5000 per round. Score decreases with distance.
 * - 0 km → 5000 pts
 * - 1000 km → ~2000 pts
 * - 5000+ km → 0 pts
 */
export function calculateScore(distanceKm: number): number {
  if (distanceKm === 0) return 5000;
  const score = Math.round(5000 * Math.exp(-distanceKm / 2000));
  return Math.max(0, score);
}
