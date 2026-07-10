import { memo } from 'react'
import { SEVERITY } from '../../utils/severity'
import { formatTimestamp } from '../../utils/formatters'

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

/**
 * @param {{
 *   stats: { total: number, high: number, medium: number, low: number, avgConfidence: number, latestDetection: string | null },
 *   loading: boolean
 * }} props
 */
function StatsPanel({ stats, loading }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-mono uppercase tracking-wider text-asphalt-500">
        Network Overview
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Active" value={stats?.total ?? 0} loading={loading} />
        <StatCard
          label="High Severity"
          value={stats?.high ?? 0}
          color={SEVERITY.high.hex}
          loading={loading}
        />
        <StatCard
          label="Medium Severity"
          value={stats?.medium ?? 0}
          color={SEVERITY.medium.hex}
          loading={loading}
        />
        <StatCard
          label="Low Severity"
          value={stats?.low ?? 0}
          color={SEVERITY.low.hex}
          loading={loading}
        />
        <StatCard
          label="Avg Confidence"
          value={stats?.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(0)}%` : '—'}
          loading={loading}
        />
        <StatCard
          label="Latest Detection"
          value={stats?.latestDetection ? formatTimestamp(stats.latestDetection) : '—'}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default memo(StatsPanel)
