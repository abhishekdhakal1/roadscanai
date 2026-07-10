import { memo } from 'react'
import StatsPanel from '../Dashboard/StatsPanel'
import FilterBar from '../Dashboard/FilterBar'
import PotholeFeed from '../Dashboard/PotholeFeed'

function Sidebar({
  stats,
  potholes,
  loading,
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  searchId,
  onSearchChange,
  selectedId,
  onSelect,
  onRetry,
  error,
}) {
  return (
    <aside className="flex h-full w-[380px] flex-shrink-0 flex-col border-r border-concrete-200 bg-concrete-50">
      <div className="p-5">
        <StatsPanel stats={stats} loading={loading} />
      </div>

      <div className="road-divider mx-5" />

      <div className="px-5 pt-4">
        <FilterBar
          filters={filters}
          onFilterChange={onFilterChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
          searchId={searchId}
          onSearchChange={onSearchChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3 feed-scroll">
        <PotholeFeed
          potholes={potholes}
          loading={loading}
          selectedId={selectedId}
          onSelect={onSelect}
          onRetry={onRetry}
          error={error}
        />
      </div>
    </aside>
  )
}

export default memo(Sidebar)
