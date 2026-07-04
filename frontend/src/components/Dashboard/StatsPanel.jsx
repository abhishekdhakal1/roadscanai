import { SEVERITY } from '../../utils/severity'

function StatCard({ label, value, color, loading }) {
  return (
    <div className="rounded-lg border border-concrete-200 bg-white px-3.5 py-3 shadow-panel">
      <p className="text-[11px] font-mono uppercase tracking-wider text-asphalt-500">{label}</p>
      <p
        className="mt-1 font-display text-2xl font-semibold"
        style={{ color: color || '#1C2226' }}
      >
        {loading ? '—' : value}
      </p>
    </div>
  )
}

export default function StatsPanel({ stats, loading }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
        Network Overview
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Detected" value={stats?.total ?? 0} loading={loading} />
        <StatCard
          label="High Severity"
          value={stats?.bySeverity?.high ?? 0}
          color={SEVERITY.high.hex}
          loading={loading}
        />
        <StatCard
          label="Medium Severity"
          value={stats?.bySeverity?.medium ?? 0}
          color={SEVERITY.medium.hex}
          loading={loading}
        />
        <StatCard
          label="Low Severity"
          value={stats?.bySeverity?.low ?? 0}
          color={SEVERITY.low.hex}
          loading={loading}
        />
      </div>
    </div>
  )
}
