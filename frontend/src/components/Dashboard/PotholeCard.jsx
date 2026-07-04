import SeverityBadge from '../common/SeverityBadge'
import { formatCoords, timeAgo } from '../../utils/formatters'

export default function PotholeCard({ pothole, active, onClick }) {
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
          {pothole.road_name}
        </p>
        <SeverityBadge level={pothole.severity} />
      </div>

      <p className="mt-1 font-mono text-xs text-asphalt-500">
        {formatCoords(pothole.lat, pothole.lng)}
      </p>

      <div className="mt-2 flex items-center justify-between text-xs text-asphalt-500">
        <span>{pothole.device_id}</span>
        <span>{timeAgo(pothole.detected_at)}</span>
      </div>
    </button>
  )
}
