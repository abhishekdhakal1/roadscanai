import { getSeverity } from '../../utils/severity'

export default function SeverityBadge({ level, className = '' }) {
  const s = getSeverity(level)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono uppercase tracking-wide ${className}`}
      style={{ backgroundColor: `${s.hex}1A`, color: s.hex }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
      {s.label}
    </span>
  )
}
