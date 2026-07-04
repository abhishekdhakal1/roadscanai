import { useCallback, useEffect, useState } from 'react'
import { getPotholes, getStats, reportPothole } from '../api/potholeApi'

// Polling interval matches the 15-second dashboard refresh cycle
// described in the proposal (Section 3.2, Working Principle).
const POLL_INTERVAL_MS = 15000

export function usePotholes() {
  const [potholes, setPotholes] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const [potholeData, statsData] = await Promise.all([getPotholes(), getStats()])
      setPotholes(potholeData)
      setStats(statsData)
      setLastSynced(new Date())
    } catch (err) {
      setError(err.message || 'Failed to reach the RoadScanAI backend')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  const simulateDetection = useCallback(async () => {
    await reportPothole({})
    await refresh()
  }, [refresh])

  return { potholes, stats, loading, error, lastSynced, refresh, simulateDetection }
}
