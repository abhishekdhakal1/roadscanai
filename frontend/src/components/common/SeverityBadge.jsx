import { getSeverity } from '../../utils/severity'

export default function SeverityBadge({ level, className = '' }) {
  const s = getSeverity(level)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[9px] font-semibold font-sans uppercase tracking-widest ${className}`}
      style={{
        backgroundColor: `${s.hex}15`,
        color: s.hex,
        border: `1px solid ${s.hex}40`
      }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: s.hex }} />
      {s.label}
    </span>
  )
}
