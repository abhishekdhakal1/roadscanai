import { memo } from 'react'
import SeverityBadge from '../common/SeverityBadge'
import { formatCoords, timeAgo } from '../../utils/formatters'

/**
 * @param {{
 *   pothole: import('../../api/potholeApi').Pothole,
 *   active: boolean,
 *   onClick: () => void
 * }} props
 */
function PotholeCard({ pothole, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md border px-4 py-3 text-left transition-colors duration-200 ${
        active
          ? 'border-brand-primary bg-brand-primary/5 shadow-sm'
          : 'border-concrete-200 bg-white hover:border-concrete-300 hover:bg-concrete-50/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-sm font-semibold text-asphalt-800">
          Pothole #{pothole.id}
        </p>
        <SeverityBadge level={pothole.severity} />
      </div>

      <p className="mt-1 font-mono text-xs text-asphalt-500">
        {formatCoords(pothole.lat, pothole.lon)}
      </p>

      <div className="mt-2 flex items-center justify-between text-xs text-asphalt-500">
        <span>{(pothole.confidence * 100).toFixed(0)}% conf</span>
        <span>×{pothole.detection_count} detections</span>
        <span>{timeAgo(pothole.last_seen)}</span>
      </div>
    </button>
  )
}

export default memo(PotholeCard)
