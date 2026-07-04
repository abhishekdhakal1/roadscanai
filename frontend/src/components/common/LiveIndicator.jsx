export default function LiveIndicator({ online = true, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`relative inline-flex h-2 w-2 ${online ? 'text-marking' : 'text-asphalt-400'}`}>
        {online && <span className="pulse-dot absolute inset-0" />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'currentColor' }} />
      </span>
      {label && (
        <span className="text-xs font-mono uppercase tracking-wider text-asphalt-500">
          {label}
        </span>
      )}
    </div>
  )
}
