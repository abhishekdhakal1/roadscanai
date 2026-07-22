import { memo, useCallback, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Topbar from '../components/Layout/Topbar'
import Sidebar from '../components/Layout/Sidebar'
import PotholeMap from '../components/Map/PotholeMap'
import { usePotholes } from '../hooks/usePotholes'
import { severityWeight } from '../utils/formatters'

/** @type {Record<string, (a: import('../api/potholeApi').Pothole, b: import('../api/potholeApi').Pothole) => number>} */
const SORT_FNS = {
  newest: (a, b) => new Date(b.last_seen) - new Date(a.last_seen),
  oldest: (a, b) => new Date(a.first_seen) - new Date(b.first_seen),
  confidence: (a, b) => b.confidence - a.confidence,
  detections: (a, b) => b.detection_count - a.detection_count,
  severity: (a, b) => severityWeight(b.severity) - severityWeight(a.severity),
}

function Dashboard() {
  const { potholes, loading, error, lastSynced, refresh } = usePotholes()

  const [filters, setFilters] = useState({ severity: 'all', minConfidence: 0 })
  const [sortBy, setSortBy] = useState('newest')
  const [searchId, setSearchId] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchId(value)
  }, [])

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
  }, [])

  /** Filtered, searched, and sorted potholes. */
  const processed = useMemo(() => {
    let result = potholes

    // Search by ID
    if (searchId.trim() !== '') {
      const query = searchId.trim()
      result = result.filter((p) => String(p.id).includes(query))
    }

    // Filter by severity
    if (filters.severity !== 'all') {
      result = result.filter((p) => p.severity === filters.severity)
    }

    // Filter by minimum confidence
    if (filters.minConfidence > 0) {
      result = result.filter((p) => p.confidence >= filters.minConfidence)
    }

    // Sort
    const sortFn = SORT_FNS[sortBy] || SORT_FNS.newest
    result = [...result].sort(sortFn)

    return result
  }, [potholes, filters, sortBy, searchId])

  /** Computed stats from the full (unfiltered) dataset. */
  const stats = useMemo(() => {
    const total = potholes.length
    const high = potholes.filter((p) => p.severity === 'high').length
    const medium = potholes.filter((p) => p.severity === 'medium').length
    const low = potholes.filter((p) => p.severity === 'low').length
    const avgConfidence =
      total > 0
        ? potholes.reduce((sum, p) => sum + p.confidence, 0) / total
        : 0
    const latestDetection =
      total > 0
        ? potholes.reduce((latest, p) =>
            new Date(p.last_seen) > new Date(latest.last_seen) ? p : latest
          ).last_seen
        : null

    return { total, high, medium, low, avgConfidence, latestDetection }
  }, [potholes])

  return (
    <div className="flex h-screen flex-col bg-surface-bg">
      <Topbar lastSynced={lastSynced} onMenuClick={() => setSidebarOpen(true)} />

      {error && (
        <div className="flex items-center justify-between border-b border-danger/20 bg-danger/5 px-4 py-2.5 text-sm text-danger sm:px-6">
          <span className="flex items-center gap-2">
            <AlertTriangle size={15} />
            {error} — showing last known data.
          </span>
          <button
            onClick={refresh}
            className="ml-4 rounded-lg border border-danger/30 px-3 py-1 text-xs font-semibold transition-colors duration-150 hover:bg-danger/10"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          stats={stats}
          potholes={processed}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          searchId={searchId}
          onSearchChange={handleSearchChange}
          selectedId={selectedId}
          onSelect={handleSelect}
          onRetry={refresh}
          error={error}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="relative flex-1 p-2 sm:p-3">
          <div className="h-full w-full overflow-hidden rounded-2xl shadow-panel">
            <PotholeMap
              potholes={processed}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default memo(Dashboard)
