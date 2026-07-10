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
      className={`w-full rounded-lg border px-3.5 py-3 text-left transition ${
        active
          ? 'border-marking bg-marking/10'
          : 'border-concrete-200 bg-white hover:border-asphalt-400'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-sm font-semibold text-asphalt-900">
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
