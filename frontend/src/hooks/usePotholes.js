import { useCallback, useEffect, useRef, useState } from 'react'
import { getUnfixedPotholes } from '../api/potholeApi'

/** Polling interval in milliseconds. */
const POLL_INTERVAL_MS = 20_000

/**
 * Custom hook that fetches unfixed potholes from the backend and
 * polls every 20 seconds. Exposes loading, error, data, and refresh().
 *
 * @returns {{
 *   potholes: import('../api/potholeApi').Pothole[],
 *   loading: boolean,
 *   error: string | null,
 *   lastSynced: Date | null,
 *   refresh: () => Promise<void>
 * }}
 */
export function usePotholes() {
  const [potholes, setPotholes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  /** Guard against overlapping requests. */
  const fetchingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setError(null)
      const data = await getUnfixedPotholes()
      setPotholes(data)
      setLastSynced(new Date())
    } catch (err) {
      setError(err.message || 'Failed to reach the RoadScanAI backend')
      // Previous data is preserved — we do NOT clear potholes on error
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { potholes, loading, error, lastSynced, refresh }
}
