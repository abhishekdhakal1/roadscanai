import { memo } from 'react'
import { Activity, AlertTriangle, ShieldAlert, ShieldCheck, Gauge, Clock } from 'lucide-react'
import { formatTimestamp } from '../../utils/formatters'

function StatCard({ icon: Icon, label, value, accent, loading }) {
  return (
    <div className="group rounded-2xl border border-surface-border bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <p
        className="text-[13px] font-bold leading-tight tracking-tight text-text-primary"
      >
        {loading ? (
          <span className="skeleton inline-block h-6 w-14 rounded-md align-middle" />
        ) : (
          <span className="text-[22px]">{value}</span>
        )}
      </p>
      <p className="mt-1 text-[12px] font-medium text-text-secondary">{label}</p>
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
      <p className="mb-3 text-[16px] font-semibold text-text-primary">
        Network Overview
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Activity} label="Total Active" value={stats?.total ?? 0} accent="#2563EB" loading={loading} />
        <StatCard icon={AlertTriangle} label="High Severity" value={stats?.high ?? 0} accent="#EF4444" loading={loading} />
        <StatCard icon={ShieldAlert} label="Medium Severity" value={stats?.medium ?? 0} accent="#F59E0B" loading={loading} />
        <StatCard icon={ShieldCheck} label="Low Severity" value={stats?.low ?? 0} accent="#22C55E" loading={loading} />
        <StatCard
          icon={Gauge}
          label="Avg Confidence"
          value={stats?.avgConfidence ? `${(stats.avgConfidence * 100).toFixed(0)}%` : '—'}
          accent="#2563EB"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Latest Detection"
          value={stats?.latestDetection ? formatTimestamp(stats.latestDetection) : '—'}
          accent="#64748B"
          loading={loading}
        />
      </div>
    </div>
  )
}

export default memo(StatsPanel)
