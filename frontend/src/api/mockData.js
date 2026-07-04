// Dummy dataset standing in for the PostgreSQL `potholes` table described
// in the RoadScanAI proposal (Section 3.1.2 / 3.7.2). Coordinates are
// scattered around Thapathali Campus, Kathmandu, so the map has a
// realistic default view. Once the FastAPI backend is live, this file
// can be deleted and potholeApi.js pointed at the real endpoints.

let idCounter = 1

function nextId() {
  return idCounter++
}

function minutesAgo(m) {
  return new Date(Date.now() - m * 60 * 1000).toISOString()
}

export const mockPotholes = [
  {
    id: nextId(),
    lat: 27.6939,
    lng: 85.32,
    severity: 'high',
    confidence: 0.94,
    device_id: 'ESP32-CAM-01',
    image_url: null,
    detected_at: minutesAgo(4),
    road_name: 'Thapathali Bridge Road',
    status: 'unresolved'
  },
  {
    id: nextId(),
    lat: 27.6985,
    lng: 85.315,
    severity: 'medium',
    confidence: 0.81,
    device_id: 'ESP32-CAM-01',
    image_url: null,
    detected_at: minutesAgo(19),
    road_name: 'Kupondole Road',
    status: 'unresolved'
  },
  {
    id: nextId(),
    lat: 27.7005,
    lng: 85.325,
    severity: 'low',
    confidence: 0.63,
    device_id: 'ESP32-CAM-02',
    image_url: null,
    detected_at: minutesAgo(41),
    road_name: 'New Baneshwor Chowk',
    status: 'unresolved'
  },
  {
    id: nextId(),
    lat: 27.6912,
    lng: 85.3105,
    severity: 'high',
    confidence: 0.97,
    device_id: 'ESP32-CAM-02',
    image_url: null,
    detected_at: minutesAgo(58),
    road_name: 'Kalimati Road',
    status: 'in_progress'
  },
  {
    id: nextId(),
    lat: 27.696,
    lng: 85.335,
    severity: 'medium',
    confidence: 0.77,
    device_id: 'ESP32-CAM-03',
    image_url: null,
    detected_at: minutesAgo(95),
    road_name: 'Tripureshwor Marg',
    status: 'unresolved'
  },
  {
    id: nextId(),
    lat: 27.7042,
    lng: 85.3195,
    severity: 'low',
    confidence: 0.58,
    device_id: 'ESP32-CAM-03',
    image_url: null,
    detected_at: minutesAgo(140),
    road_name: 'Putalisadak Road',
    status: 'resolved'
  },
  {
    id: nextId(),
    lat: 27.6928,
    lng: 85.328,
    severity: 'high',
    confidence: 0.9,
    device_id: 'ESP32-CAM-01',
    image_url: null,
    detected_at: minutesAgo(210),
    road_name: 'Sinamangal Road',
    status: 'unresolved'
  },
  {
    id: nextId(),
    lat: 27.699,
    lng: 85.3305,
    severity: 'medium',
    confidence: 0.72,
    device_id: 'ESP32-CAM-04',
    image_url: null,
    detected_at: minutesAgo(300),
    road_name: 'Maitighar Mandala',
    status: 'in_progress'
  }
]

export const mockDevices = [
  { device_id: 'ESP32-CAM-01', label: 'Vehicle 1 — Micro Bus', online: true },
  { device_id: 'ESP32-CAM-02', label: 'Vehicle 2 — Taxi', online: true },
  { device_id: 'ESP32-CAM-03', label: 'Vehicle 3 — Micro Bus', online: false },
  { device_id: 'ESP32-CAM-04', label: 'Vehicle 4 — Delivery Van', online: true }
]

export function addMockPothole(partial) {
  const record = {
    id: nextId(),
    lat: 27.697 + (Math.random() - 0.5) * 0.02,
    lng: 85.32 + (Math.random() - 0.5) * 0.02,
    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    confidence: Number((0.55 + Math.random() * 0.4).toFixed(2)),
    device_id: mockDevices[Math.floor(Math.random() * mockDevices.length)].device_id,
    image_url: null,
    detected_at: new Date().toISOString(),
    road_name: 'Unnamed Survey Segment',
    status: 'unresolved',
    ...partial
  }
  mockPotholes.unshift(record)
  return record
}
