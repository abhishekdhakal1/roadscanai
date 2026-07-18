import { memo } from 'react'
import LiveIndicator from '../common/LiveIndicator'

function Topbar({ lastSynced }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-concrete-200 bg-white px-6 py-4 transition-all duration-300">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white font-bold transition-transform duration-300">
          R
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-asphalt-800 transition-colors duration-300">
            RoadScan<span className="text-brand-primary">AI</span>
          </h1>
          <p className="text-xs font-medium text-asphalt-500">Smart Pothole Detection & GPS Mapping</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <LiveIndicator
          online={!!lastSynced}
          label={lastSynced ? `Synced ${lastSynced.toLocaleTimeString()}` : 'Connecting…'}
        />
      </div>
    </header>
  )
}

export default memo(Topbar)
