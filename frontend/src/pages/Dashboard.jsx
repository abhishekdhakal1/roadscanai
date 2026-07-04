import { useMemo, useState } from 'react'
import Topbar from '../components/Layout/Topbar'
import Sidebar from '../components/Layout/Sidebar'
import PotholeMap from '../components/Map/PotholeMap'
import { usePotholes } from '../hooks/usePotholes'

export default function Dashboard() {
  const { potholes, stats, loading, error, lastSynced, simulateDetection } = usePotholes()
  const [filters, setFilters] = useState({ severity: 'all', status: 'all' })
  const [selectedId, setSelectedId] = useState(null)
  const [simulating, setSimulating] = useState(false)

  const filtered = useMemo(() => {
    return potholes.filter((p) => {
      const severityOk = filters.severity === 'all' || p.severity === filters.severity
      const statusOk = filters.status === 'all' || p.status === filters.status
      return severityOk && statusOk
    })
  }, [potholes, filters])

  async function handleSimulate() {
    setSimulating(true)
    try {
      await simulateDetection()
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-concrete-50">
      <Topbar lastSynced={lastSynced} onSimulate={handleSimulate} simulating={simulating} />

      {error && (
        <div className="border-b border-severity-high/30 bg-severity-high/10 px-6 py-2 text-sm text-severity-high">
          {error} — showing last known data.
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <Sidebar
          stats={stats}
          potholes={filtered}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <main className="relative flex-1">
          <PotholeMap potholes={filtered} selectedId={selectedId} onSelect={setSelectedId} />
        </main>
      </div>
    </div>
  )
}
