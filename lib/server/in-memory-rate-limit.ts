/**
 * Per-process sliding-window limiter used by the newsletter endpoint.
 * Serverless and multi-instance deployments should add a shared store or edge rule
 * when strict cross-instance enforcement is required.
 */
const requestTimestamps = new Map<string, number[]>();

export function isRateLimited(key: string, maximumRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const recentTimestamps = (requestTimestamps.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recentTimestamps.length >= maximumRequests) {
    requestTimestamps.set(key, recentTimestamps);
    return true;
  }

  recentTimestamps.push(now);
  requestTimestamps.set(key, recentTimestamps);

  if (requestTimestamps.size > 5000) {
    for (const [storedKey, timestamps] of requestTimestamps) {
      if (!timestamps.some((timestamp) => now - timestamp < windowMs)) requestTimestamps.delete(storedKey);
    }
  }

  return false;
}
