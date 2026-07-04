# RoadScanAI Dashboard

Frontend for **RoadScanAI: A Smart Pothole Detection & GPS Mapping System**
(Tribhuvan University, Thapathali Campus — minor project proposal).

Built with **React (Vite) + Tailwind CSS + React-Leaflet**. There is no live
backend yet, so the app runs entirely on an in-memory dummy API that mirrors
the FastAPI endpoints described in the proposal's Software Layer — swap in
the real backend later without touching any component.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

```bash
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Folder structure

```
src/
├── api/
│   ├── potholeApi.js     # All API calls. USE_MOCK toggle switches
│   │                      # between dummy data and a real FastAPI backend.
│   └── mockData.js        # In-memory dummy dataset (Kathmandu coordinates)
├── components/
│   ├── Layout/
│   │   ├── Topbar.jsx      # Title, live-sync indicator, simulate button
│   │   └── Sidebar.jsx     # Stats + filters + detection feed
│   ├── Dashboard/
│   │   ├── StatsPanel.jsx  # Total / severity counts
│   │   ├── FilterBar.jsx   # Severity & status filter pills
│   │   ├── PotholeFeed.jsx # Scrollable list wrapper
│   │   └── PotholeCard.jsx # Single feed item
│   ├── Map/
│   │   └── PotholeMap.jsx  # Leaflet map, colour-coded markers, popups
│   └── common/
│       ├── SeverityBadge.jsx
│       └── LiveIndicator.jsx
├── hooks/
│   └── usePotholes.js      # Fetching + 15s polling (matches proposal §3.2)
├── pages/
│   └── Dashboard.jsx       # Composes Topbar + Sidebar + Map
├── utils/
│   ├── severity.js         # Severity → colour/label mapping
│   └── formatters.js       # Coordinate/time formatting helpers
├── App.jsx
├── main.jsx
└── index.css
```

## Connecting the real backend

The proposal's backend (Section 3.1.2) is a FastAPI service backed by
PostgreSQL, exposing endpoints such as `GET /potholes` and receiving
`POST` requests from the SIM800L GSM module on the ESP32-CAM unit.

To connect it once it exists:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your
   deployed FastAPI URL (Render/Railway).
2. In `src/api/potholeApi.js`, set `const USE_MOCK = false`.
3. Make sure your FastAPI backend implements (or adjust the paths below
   to match what you actually build):

   | Method | Path                     | Purpose                              |
   |--------|--------------------------|---------------------------------------|
   | GET    | `/potholes`              | List all detection events             |
   | GET    | `/potholes/{id}`         | Single detection event                |
   | GET    | `/potholes/stats`        | Aggregate counts for the stats panel  |
   | POST   | `/potholes`              | Create a detection event (from device)|
   | PATCH  | `/potholes/{id}/status`  | Update repair status                  |
   | GET    | `/devices`               | List of edge devices (vehicles)       |

No other file needs to change — every component consumes data through
`src/hooks/usePotholes.js`, which calls the functions in `potholeApi.js`.

## Notes

- Map tiles are served from the public OpenStreetMap tile server, fine for
  development; swap in a paid tile provider for production traffic.
- "Simulate Detection" in the top bar mimics a new `POST /potholes` event
  arriving from a vehicle, the same way the SIM800L module would push data
  in production.
