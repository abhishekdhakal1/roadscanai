const SEVERITY_OPTIONS = ['all', 'high', 'medium', 'low']
const STATUS_OPTIONS = ['all', 'unresolved', 'in_progress', 'resolved']

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-wide transition ${
        active
          ? 'bg-asphalt-900 text-concrete-50'
          : 'bg-concrete-100 text-asphalt-600 hover:bg-concrete-200'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterBar({ filters, onFilterChange }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
          Severity
        </p>
        <div className="flex flex-wrap gap-1.5">
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

      <div>
        <p className="mb-1.5 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <Pill
              key={opt}
              active={filters.status === opt}
              onClick={() => onFilterChange({ ...filters, status: opt })}
            >
              {opt.replace('_', ' ')}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  )
}
