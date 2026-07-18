import { memo } from 'react'

const SEVERITY_OPTIONS = ['all', 'high', 'medium', 'low']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'confidence', label: 'Highest Confidence' },
  { value: 'detections', label: 'Most Detections' },
  { value: 'severity', label: 'Highest Severity' },
]

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
        active
          ? 'bg-brand-primary text-white shadow-sm'
          : 'text-asphalt-500 hover:text-asphalt-800'
      }`}
    >
      {children}
    </button>
  )
}

function FilterBar({ filters, onFilterChange, sortBy, onSortChange, searchId, onSearchChange }) {
  return (
    <div className="space-y-3">
      {/* Search by ID */}
      <div>
        <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-asphalt-500">
          Search by ID
        </p>
        <input
          type="text"
          value={searchId}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Enter pothole ID…"
          className="w-full rounded-md border border-concrete-200 bg-white px-3 py-2.5 text-xs text-asphalt-800 placeholder:text-asphalt-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
        />
      </div>

      {/* Severity filter */}
      <div>
        <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-asphalt-500">
          Severity
        </p>
        <div className="flex w-full rounded-md bg-concrete-100 p-1 border border-concrete-200">
          {SEVERITY_OPTIONS.map((opt) => (
            <Pill
              key={opt}
              active={filters.severity === opt}
              onClick={() => onFilterChange({ ...filters, severity: opt })}
            >
              {opt}
            </Pill>
          ))}
        </div>
      </div>

      {/* Minimum confidence */}
      <div>
        <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-asphalt-500">
          Min Confidence: {(filters.minConfidence * 100).toFixed(0)}%
        </p>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={filters.minConfidence}
          onChange={(e) =>
            onFilterChange({ ...filters, minConfidence: parseFloat(e.target.value) })
          }
          className="w-full accent-brand-primary"
        />
      </div>

      {/* Sort */}
      <div>
        <p className="mb-1.5 text-[10px] font-mono uppercase tracking-wider text-asphalt-500">
          Sort By
        </p>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-md border border-concrete-200 bg-white px-3 py-2.5 text-xs text-asphalt-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default memo(FilterBar)
