import { memo } from 'react'
import LiveIndicator from '../common/LiveIndicator'

function Topbar({ lastSynced }) {
  return (
    <header className="flex items-center justify-between border-b border-asphalt-800 bg-asphalt-900 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-marking text-asphalt-950 font-display font-bold">
          R
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold leading-tight text-concrete-50">
            RoadScan<span className="text-marking">AI</span>
          </h1>
          <p className="text-xs text-asphalt-400">Smart Pothole Detection & GPS Mapping</p>
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
