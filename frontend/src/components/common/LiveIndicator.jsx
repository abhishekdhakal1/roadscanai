export default function LiveIndicator({ online = true, label }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-150 ${
        online
          ? 'border-success/20 bg-success/10 text-success'
          : 'border-surface-border bg-surface-hover text-text-secondary'
      }`}
    >
      <span className="relative inline-flex h-2 w-2">
        {online && <span className="pulse-dot absolute inset-0" />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'currentColor' }} />
      </span>
      {label && (
        <span className="text-xs font-medium tracking-wide">
          {label}
        </span>
      )}
    </div>
  )
}
