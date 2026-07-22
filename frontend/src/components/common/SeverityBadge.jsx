import { getSeverity } from '../../utils/severity'

export default function SeverityBadge({ level, className = '' }) {
  const s = getSeverity(level)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold font-sans tracking-wide ${className}`}
      style={{
        backgroundColor: `${s.hex}14`,
        color: s.hex,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.hex }} />
      {s.label}
    </span>
  )
}
