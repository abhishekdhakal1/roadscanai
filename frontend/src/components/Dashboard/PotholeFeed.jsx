import { memo } from 'react'
import PotholeCard from './PotholeCard'

function PotholeFeed({ potholes, loading, selectedId, onSelect, onRetry, error }) {
  // Loading state — skeleton shimmer
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-concrete-200 border-t-marking" />
        <p className="text-sm text-asphalt-500">Loading detections…</p>
      </div>
    )
  }

  // Error state with retry
  if (error && potholes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-severity-high/40 bg-severity-high/5 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-severity-high">Connection Error</p>
        <p className="mt-1 text-xs text-asphalt-500">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-md border border-severity-high/40 px-4 py-2 text-xs font-mono uppercase tracking-wide text-severity-high transition hover:bg-severity-high/10"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (potholes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-concrete-200 px-4 py-8 text-center">
        <p className="text-2xl">🛣️</p>
        <p className="mt-2 text-sm font-semibold text-asphalt-700">No active potholes detected.</p>
        <p className="mt-1 text-xs text-asphalt-500">
          No detections match the current filters, or the road is clear!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="mb-1 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
        Detections ({potholes.length})
      </p>
      {potholes.map((p) => (
        <PotholeCard
          key={p.id}
          pothole={p}
          active={p.id === selectedId}
          onClick={() => onSelect(p.id)}
        />
      ))}
    </div>
  )
}

export default memo(PotholeFeed)
