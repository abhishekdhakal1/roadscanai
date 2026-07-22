import { memo } from 'react'
import { X } from 'lucide-react'
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
  open = true,
  onClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[1200] bg-slate-900/30 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[1300] flex h-full w-[85vw] max-w-[380px] flex-shrink-0 transform flex-col overflow-hidden border-r border-surface-border bg-surface-bg transition-transform duration-200 ease-out md:static md:z-0 md:w-[380px] md:max-w-none md:translate-x-0 ${
          open ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 md:hidden">
          <p className="text-[16px] font-semibold text-text-primary">Dashboard</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
          >
            <X size={18} />
          </button>
        </div>

        <div className="feed-scroll flex-1 overflow-y-auto px-5 py-5">
          <StatsPanel stats={stats} loading={loading} />

          <div className="my-5 h-px bg-surface-border" />

          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            sortBy={sortBy}
            onSortChange={onSortChange}
            searchId={searchId}
            onSearchChange={onSearchChange}
          />

          <div className="my-5 h-px bg-surface-border" />

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
    </>
  )
}

export default memo(Sidebar)
