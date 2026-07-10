// ---------------------------------------------------------------------------
// RoadScanAI — API Layer
//
// Single endpoint consumed by the frontend:
//   GET /api/v1/potholes/unfixed
//
// Base URL is read from the VITE_API_URL environment variable.
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Pothole
 * @property {number}  id               - Unique detection ID
 * @property {number}  lat              - Latitude of the pothole
 * @property {number}  lon              - Longitude of the pothole
 * @property {'high'|'medium'|'low'} severity - Severity classification
 * @property {number}  confidence       - Model confidence (0–1)
 * @property {string}  first_seen       - ISO 8601 timestamp of first detection
 * @property {string}  last_seen        - ISO 8601 timestamp of most recent detection
 * @property {number}  detection_count  - Number of times this pothole was detected
 * @property {string}  status           - Current status (e.g. "active")
 */

const API_BASE_URL = import.meta.env.VITE_API_URL 
const REQUEST_TIMEOUT_MS = 10_000

/**
 * Fetch all unfixed potholes from the backend.
 * @returns {Promise<Pothole[]>}
 */
export async function getUnfixedPotholes() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/potholes/unfixed`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('Invalid response: expected JSON')
    }

    /** @type {Pothole[]} */
    const data = await res.json()
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out — the backend may be unreachable')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
