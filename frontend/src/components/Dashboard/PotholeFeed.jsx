import PotholeCard from './PotholeCard'

export default function PotholeFeed({ potholes, loading, selectedId, onSelect }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-lg bg-concrete-100" />
        ))}
      </div>
    )
  }

  if (potholes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-concrete-200 px-4 py-8 text-center">
        <p className="text-sm text-asphalt-500">No detections match these filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="mb-1 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
        Recent Detections ({potholes.length})
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
