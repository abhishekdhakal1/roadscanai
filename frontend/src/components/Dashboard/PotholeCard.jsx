import { memo } from 'react'
import SeverityBadge from '../common/SeverityBadge'
import { getSeverity } from '../../utils/severity'
import { formatCoords, timeAgo } from '../../utils/formatters'

/**
 * @param {{
 *   pothole: import('../../api/potholeApi').Pothole,
 *   active: boolean,
 *   onClick: () => void
 * }} props
 */
function PotholeCard({ pothole, active, onClick }) {
  const s = getSeverity(pothole.severity)

  return (
    <button
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white pl-4 pr-3.5 py-3 text-left transition-all duration-150 ${
        active
          ? 'border-primary/40 shadow-card-hover ring-2 ring-primary/10'
          : 'border-surface-border hover:-translate-y-0.5 hover:border-surface-border hover:shadow-card-hover'
      }`}
    >
      <span
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: s.hex }}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold text-text-primary">
          Pothole #{pothole.id}
        </p>
        <SeverityBadge level={pothole.severity} />
      </div>

      <p className="mt-1 text-[12px] text-text-secondary">
        {formatCoords(pothole.lat, pothole.lon)}
      </p>

      <div className="mt-2.5 flex items-center justify-between border-t border-surface-border pt-2 text-[12px] font-medium text-text-secondary">
        <span>{(pothole.confidence * 100).toFixed(0)}% conf</span>
        <span>×{pothole.detection_count}</span>
        <span>{timeAgo(pothole.last_seen)}</span>
      </div>
    </button>
  )
}

export default memo(PotholeCard)
