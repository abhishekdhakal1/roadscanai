import { memo } from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import PotholeCard from './PotholeCard'

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-3.5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton mt-2 h-3 w-32 rounded-md" />
      <div className="mt-3 flex gap-3">
        <div className="skeleton h-3 w-12 rounded-md" />
        <div className="skeleton h-3 w-10 rounded-md" />
        <div className="skeleton h-3 w-14 rounded-md" />
      </div>
    </div>
  )
}

function PotholeFeed({ potholes, loading, selectedId, onSelect, onRetry, error }) {
  // Loading state — skeleton shimmer
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state with retry
  if (error && potholes.length === 0) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-8 text-center">
        <AlertTriangle size={22} className="mx-auto text-danger" />
        <p className="mt-2 text-sm font-semibold text-danger">Connection Error</p>
        <p className="mt-1 text-xs text-text-secondary">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg border border-danger/30 px-4 py-2 text-xs font-semibold text-danger transition-colors duration-150 hover:bg-danger/10"
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
      <div className="rounded-2xl border border-dashed border-surface-border px-4 py-8 text-center">
        <MapPin size={22} className="mx-auto text-text-secondary" />
        <p className="mt-2 text-sm font-semibold text-text-primary">No active potholes detected.</p>
        <p className="mt-1 text-xs text-text-secondary">
          No detections match the current filters, or the road is clear!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="mb-1 text-[12px] font-semibold text-text-secondary">
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
