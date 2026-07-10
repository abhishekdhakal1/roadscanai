import { memo, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getSeverity } from '../../utils/severity'
import { formatCoords, formatTimestamp } from '../../utils/formatters'
import SeverityBadge from '../common/SeverityBadge'

/**
 * Build a color-coded Leaflet divIcon by severity level.
 * High → Red, Medium → Orange, Low → Yellow/Green
 */
function buildIcon(level) {
  const s = getSeverity(level)
  return L.divIcon({
    className: '',
    html: `<div class="pothole-pin" style="background:${s.hex}"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

const KATHMANDU_CENTER = [27.6975, 85.32]

function FlyToSelected({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lon], 16, { duration: 0.8 })
    }
  }, [selected, map])
  return null
}

function PotholeMap({ potholes, selectedId, onSelect }) {
  const markerRefs = useRef({})
  const selected = useMemo(
    () => potholes.find((p) => p.id === selectedId) || null,
    [potholes, selectedId]
  )

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
          position={[p.lat, p.lon]}
          icon={buildIcon(p.severity)}
          eventHandlers={{ click: () => onSelect(p.id) }}
          ref={(ref) => {
            if (ref) markerRefs.current[p.id] = ref
          }}
        >
          <Popup>
            <div className="p-3 min-w-[220px]">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-asphalt-900">
                  Pothole #{p.id}
                </p>
                <SeverityBadge level={p.severity} />
              </div>

              <div className="mt-2 space-y-1 text-xs text-asphalt-600">
                <p><span className="font-semibold">ID:</span> {p.id}</p>
                <p><span className="font-semibold">Severity:</span> {p.severity}</p>
                <p><span className="font-semibold">Confidence:</span> {(p.confidence * 100).toFixed(1)}%</p>
                <p><span className="font-semibold">Detection Count:</span> {p.detection_count}</p>
                <p><span className="font-semibold">Status:</span> {p.status}</p>
                <p><span className="font-semibold">First Seen:</span> {formatTimestamp(p.first_seen)}</p>
                <p><span className="font-semibold">Last Seen:</span> {formatTimestamp(p.last_seen)}</p>
                <p className="font-mono text-[11px] text-asphalt-500 pt-1">
                  {formatCoords(p.lat, p.lon)}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default memo(PotholeMap)
