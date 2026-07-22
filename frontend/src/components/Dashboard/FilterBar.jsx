import { memo, useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'

const SEVERITY_OPTIONS = ['all', 'high', 'medium', 'low']

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'confidence', label: 'Highest Confidence' },
  { value: 'detections', label: 'Most Detections' },
  { value: 'severity', label: 'Highest Severity' },
]

function Segment({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold uppercase tracking-wide transition-all duration-150 ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function FilterBar({ filters, onFilterChange, sortBy, onSortChange, searchId, onSearchChange }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mb-3 flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-[16px] font-semibold text-text-primary">
          <Filter size={15} className="text-text-secondary" />
          Filters
        </span>
        <ChevronDown
          size={16}
          className={`text-text-secondary transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
      </button>

      <div
        className={`space-y-4 overflow-hidden transition-all duration-200 ${
          collapsed ? 'max-h-0' : 'max-h-[600px]'
        }`}
      >
        {/* Search by ID */}
        <div>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by pothole ID…"
              className="w-full rounded-xl border border-surface-border bg-white py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary/70 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Severity filter */}
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-secondary">
            Severity
          </p>
          <div className="flex w-full gap-1 rounded-xl bg-surface-hover p-1">
            {SEVERITY_OPTIONS.map((opt) => (
              <Segment
                key={opt}
                active={filters.severity === opt}
                onClick={() => onFilterChange({ ...filters, severity: opt })}
              >
                {opt}
              </Segment>
            ))}
          </div>
        </div>

        {/* Minimum confidence */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[12px] font-semibold text-text-secondary">Min Confidence</p>
            <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
              {(filters.minConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={filters.minConfidence}
            onChange={(e) =>
              onFilterChange({ ...filters, minConfidence: parseFloat(e.target.value) })
            }
            className="modern-slider w-full"
          />
        </div>

        {/* Sort */}
        <div>
          <p className="mb-1.5 text-[12px] font-semibold text-text-secondary">
            Sort By
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-surface-border bg-white py-2.5 pl-3 pr-9 text-sm text-text-primary transition-all duration-150 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(FilterBar)
