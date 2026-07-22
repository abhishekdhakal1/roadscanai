import { memo, useEffect, useState } from 'react'
import { MapPin, Menu } from 'lucide-react'
import LiveIndicator from '../common/LiveIndicator'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function Topbar({ lastSynced, onMenuClick }) {
  const now = useClock()

  return (
    <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-surface-border bg-white px-4 shadow-nav sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-150 hover:bg-surface-hover md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <MapPin size={18} strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <h1 className="text-[20px] font-bold tracking-tight text-text-primary sm:text-[24px]">
            RoadScan<span className="text-primary">AI</span>
          </h1>
          <p className="hidden text-[13px] font-medium text-text-secondary sm:block">
            AI Road Condition Monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <LiveIndicator
          online={!!lastSynced}
          label={lastSynced ? `Synced ${lastSynced.toLocaleTimeString()}` : 'Connecting…'}
        />

        <div className="hidden h-6 w-px bg-surface-border sm:block" />

        <p className="hidden text-sm font-medium text-text-secondary sm:block">
          {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          <span className="mx-1.5 text-surface-border">•</span>
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div className="hidden h-6 w-px bg-surface-border sm:block" />

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary ring-1 ring-inset ring-surface-border">
          RS
        </div>
      </div>
    </header>
  )
}

export default memo(Topbar)

