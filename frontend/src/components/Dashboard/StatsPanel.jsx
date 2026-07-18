import { memo, useMemo } from 'react'
import { SEVERITY } from '../../utils/severity'
import { formatTimestamp } from '../../utils/formatters'

function Sparkline({ color, data }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 30 - ((val - min) / range) * 30
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 -5 100 40" className="w-14 h-6 overflow-visible opacity-60" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color || '#64748B'}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        points={points}
      />
    </svg>
  )
}

function StatCard({ label, value, color, loading, showTrend = false }) {
  // Simulated 7-day trend data for visual effect
  const trendData = useMemo(() => Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 5), [])

  return (
    <div className="rounded-md bg-white px-3 py-2.5 flex flex-col justify-between shadow-sm">
      <p className="text-[10px] font-mono uppercase tracking-wider text-asphalt-500">{label}</p>
      <div className="flex items-end justify-between mt-1.5">
        <p
          className="text-xl font-bold tracking-tight"
          style={{ color: color || '#1E293B' }}
        >
          {loading ? '—' : value}
        </p>
        {showTrend && !loading && (
          <Sparkline color={color} data={trendData} />
        )}
      </div>
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
        <StatCard label="Total Active" value={stats?.total ?? 0} loading={loading} showTrend />
        <StatCard
          label="High Severity"
          value={stats?.high ?? 0}
          color={SEVERITY.high.hex}
          loading={loading}
          showTrend
        />
        <StatCard
          label="Medium Severity"
          value={stats?.medium ?? 0}
          color={SEVERITY.medium.hex}
          loading={loading}
          showTrend
        />
        <StatCard
          label="Low Severity"
          value={stats?.low ?? 0}
          color={SEVERITY.low.hex}
          loading={loading}
          showTrend
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
