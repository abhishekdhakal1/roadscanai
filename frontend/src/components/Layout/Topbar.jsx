import LiveIndicator from '../common/LiveIndicator'

export default function Topbar({ lastSynced, onSimulate, simulating }) {
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
        <LiveIndicator online label={lastSynced ? `Synced ${lastSynced.toLocaleTimeString()}` : 'Connecting…'} />
        <button
          onClick={onSimulate}
          disabled={simulating}
          className="rounded-md border border-asphalt-700 bg-asphalt-800 px-3.5 py-2 text-xs font-mono uppercase tracking-wide text-concrete-100 transition hover:border-marking hover:text-marking disabled:cursor-not-allowed disabled:opacity-50"
        >
          {simulating ? 'Sending…' : 'Simulate Detection'}
        </button>
      </div>
    </header>
  )
}
