// -----------------------------------------------------------------------
// RoadScanAI API layer
//
// This mirrors the FastAPI backend described in the proposal
// (Section 3.1.2 Software Layer):
//
//   GET   /potholes            -> list all detection events
//   GET   /potholes/:id        -> single detection event
//   GET   /potholes/stats      -> aggregate counts for the stats panel
//   POST  /potholes            -> create a detection event (sent by the
//                                  ESP32-CAM/SIM800L unit over GSM in
//                                  production; simulated here)
//   PATCH /potholes/:id/status -> update repair status from the dashboard
//   GET   /devices             -> list of edge devices (vehicles) online
//
// Right now there is no backend, so every function below resolves from
// the in-memory mock dataset with an artificial delay to mimic network
// latency. When the FastAPI + PostgreSQL backend is deployed, set
// VITE_API_BASE_URL in a .env file and flip USE_MOCK to false -- every
// call site in the app stays the same.
// -----------------------------------------------------------------------

import { mockPotholes, mockDevices, addMockPothole } from './mockData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MOCK = true // set to false once the real FastAPI backend is deployed

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json()
}

// GET /potholes
export async function getPotholes() {
  if (USE_MOCK) {
    await delay(400)
    return [...mockPotholes].sort(
      (a, b) => new Date(b.detected_at) - new Date(a.detected_at)
    )
  }
  return request('/potholes')
}

// GET /potholes/:id
export async function getPotholeById(id) {
  if (USE_MOCK) {
    await delay(250)
    const found = mockPotholes.find((p) => p.id === id)
    if (!found) throw new Error('Pothole not found')
    return found
  }
  return request(`/potholes/${id}`)
}

// GET /potholes/stats
export async function getStats() {
  if (USE_MOCK) {
    await delay(300)
    const total = mockPotholes.length
    const bySeverity = { low: 0, medium: 0, high: 0 }
    const byStatus = { unresolved: 0, in_progress: 0, resolved: 0 }
    mockPotholes.forEach((p) => {
      bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
    })
    return { total, bySeverity, byStatus }
  }
  return request('/potholes/stats')
}

// POST /potholes  (in production, sent by SIM800L via HTTP POST/GPRS)
export async function reportPothole(payload) {
  if (USE_MOCK) {
    await delay(350)
    return addMockPothole(payload)
  }
  return request('/potholes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// PATCH /potholes/:id/status
export async function updatePotholeStatus(id, status) {
  if (USE_MOCK) {
    await delay(250)
    const record = mockPotholes.find((p) => p.id === id)
    if (record) record.status = status
    return record
  }
  return request(`/potholes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

// GET /devices
export async function getDevices() {
  if (USE_MOCK) {
    await delay(200)
    return mockDevices
  }
  return request('/devices')
}
