/** Small, dependency-free request guards used by the Express server (and unit-tested on their own). */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** True for a canonical UUID (versions 1–8), the format used for conversation ids. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

export interface RateLimiter {
  /** Records a request and returns true when the client is over its limit. */
  isLimited(clientKey: string, now: number): boolean
}

/**
 * Per-client sliding window limiter: each client (e.g. an IP address)
 * may make `limit` requests per `windowMs`, independently of other clients.
 */
export function createRateLimiter(limit: number, windowMs: number, maxClients = 5_000): RateLimiter {
  const requestsByClient = new Map<string, number[]>()

  return {
    isLimited(clientKey, now) {
      const recent = (requestsByClient.get(clientKey) ?? []).filter(
        (timestamp) => now - timestamp < windowMs,
      )

      if (recent.length >= limit) {
        requestsByClient.set(clientKey, recent)
        return true
      }

      recent.push(now)
      requestsByClient.set(clientKey, recent)

      // Keep memory bounded: forget clients with no recent requests.
      if (requestsByClient.size > maxClients) {
        for (const [key, timestamps] of requestsByClient) {
          if (timestamps.every((timestamp) => now - timestamp >= windowMs)) {
            requestsByClient.delete(key)
          }
        }
      }

      return false
    },
  }
}
