/**
 * Format latitude and longitude as a readable coordinate string.
 * @param {number} lat
 * @param {number} lon
 * @returns {string}
 */
export function formatCoords(lat, lon) {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

/**
 * Format an ISO timestamp into a locale-friendly date/time string.
 * @param {string} isoString
 * @returns {string}
 */
export function formatTimestamp(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Return a human-friendly "time ago" string from an ISO timestamp.
 * @param {string} isoString
 * @returns {string}
 */
export function timeAgo(isoString) {
  if (!isoString) return '—'
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 0) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Numeric severity weight for sorting (higher = more severe).
 * @param {'high'|'medium'|'low'} severity
 * @returns {number}
 */
export function severityWeight(severity) {
  const weights = { high: 3, medium: 2, low: 1 }
  return weights[severity] ?? 0
}
