import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getSeverity } from '../../utils/severity'
import { formatCoords, formatTimestamp } from '../../utils/formatters'
import SeverityBadge from '../common/SeverityBadge'

// Default Leaflet marker icons reference image files that don't resolve
// correctly under Vite's bundling, so we build custom divIcons instead.
// This also lets us color-code markers by severity per the proposal's
// "colour-coded marker" dashboard requirement (Section 4, Expected Outcome).
function buildIcon(level) {
  const s = getSeverity(level)
  return L.divIcon({
    className: '',
    html: `<div class="pothole-pin" style="background:${s.hex}"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  })
}

const KATHMANDU_CENTER = [27.6975, 85.32]

function FlyToSelected({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 16, { duration: 0.8 })
    }
  }, [selected, map])
  return null
}

export default function PotholeMap({ potholes, selectedId, onSelect }) {
  const markerRefs = useRef({})
  const selected = potholes.find((p) => p.id === selectedId)

  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId].openPopup()
    }
  }, [selectedId])

  return (
    <MapContainer
      center={KATHMANDU_CENTER}
      zoom={14}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToSelected selected={selected} />

      {potholes.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={buildIcon(p.severity)}
          eventHandlers={{ click: () => onSelect(p.id) }}
          ref={(ref) => {
            if (ref) markerRefs.current[p.id] = ref
          }}
        >
          <Popup>
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-asphalt-900">
                  {p.road_name}
                </p>
                <SeverityBadge level={p.severity} />
              </div>
              <p className="mt-1.5 font-mono text-xs text-asphalt-500">
                {formatCoords(p.lat, p.lng)}
              </p>
              <div className="mt-2 space-y-1 text-xs text-asphalt-600">
                <p>Confidence: {(p.confidence * 100).toFixed(0)}%</p>
                <p>Device: {p.device_id}</p>
                <p>Detected: {formatTimestamp(p.detected_at)}</p>
                <p>Status: {p.status.replace('_', ' ')}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
