# RailGuard — Member 6: Maps, Satellite & Data Module

**Smart India Hackathon (SIH 2026) • Problem Statement SIH26027**  
*AI-Powered Railway Risk Assessment & Automatic Maintenance Block Planning System*

---

## 1. Purpose of Member 6 Module

As **Member 6 (Maps, Satellite & Data)**, this module serves as the **geospatial and environmental telemetry backbone** for RailGuard. It is responsible for:

1. **Railway Route Mapping**: Visualizing Indian Railways corridors, track geometries, and double/triple/quadruple line configurations.
2. **OpenStreetMap Integration**: Providing responsive vector street maps with open attribution.
3. **Satellite Imagery Layer**: Providing high-resolution aerial earth observation tiles (Esri World Imagery / Mapbox) to inspect terrain around rail tracks.
4. **Interactive Leaflet Engine**: Supporting pan, zoom, route inspection popups, and track centering.
5. **Weather Telemetry Service**: Integrating temperature, humidity, rainfall, wind speed, and atmospheric conditions across track sections.
6. **Environmental Hazard Modeling**: Visualizing floodplains, landslide rockfall zones, waterlogging hotspots, and vegetation encroachments.
7. **Synthetic Data Engine**: Generating 32 realistic Indian Railways track sections across 6 zones (NR, CR, WR, ER, SCR, SR) with matching weather and environmental data.
8. **Decoupled Service Layer**: Ensuring data is managed via clean JavaScript services (`railwayService.js` and `weatherService.js`) ready to switch from local JSON to live FastAPI endpoints.

---

## 2. Technologies Used

- **Frontend Runtime**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Map & GIS**: Leaflet (`leaflet 1.9.4`), React-Leaflet (`react-leaflet 5.0.0`), OpenStreetMap Tile Server
- **Satellite Provider**: Esri World Imagery (ArcGIS REST Tile API - No API key required)
- **Styling**: Tailwind CSS & Glassmorphic Custom Theme
- **Icons**: Lucide React (`lucide-react`)
- **Data Formats**: JSON, CSV, GeoJSON-compatible coordinate arrays
- **Synthetic Data Generator**: Python 3.10+ (Standard Library: `json`, `csv`, `pathlib`)

---

## 3. Project Directory Structure

```text
Railguard/
│
├── data/                                 # [MEMBER 6 DATASETS]
│   ├── railway_sections.json             # 32 Indian Railways track sections (JSON)
│   ├── railway_sections.csv              # Tabular format for Member 1 Database seeding
│   ├── weather_data.json                 # Atmospheric weather metrics keyed by section_id
│   └── environmental_risk.json           # Environmental hazard scores (0–100) & descriptions
│
├── scripts/                              # [MEMBER 6 GENERATORS]
│   └── generate_data.py                  # Python generator creating all synthetic datasets
│
├── frontend/
│   ├── .env.example                      # Satellite, Weather & API configuration template
│   ├── src/
│   │   ├── components/
│   │   │   ├── RailwayMap.jsx            # [MEMBER 6] Master Interactive Leaflet Map
│   │   │   ├── MapFilters.jsx            # [MEMBER 6] Risk & Environmental Hazard Filter Bar
│   │   │   ├── MapLegend.jsx             # [MEMBER 6] Railway Safety & Hazard Legend
│   │   │   ├── SectionDetails.jsx        # [MEMBER 6] Telemetry & Environmental Sidebar
│   │   │   ├── EnvironmentalMarkers.jsx  # [MEMBER 6] Custom Pulsing Hazard Leaflet Icons
│   │   │   └── Navbar.jsx                # Navigation header with "GeoTrack & Satellite Map" tab
│   │   │
│   │   ├── services/
│   │   │   ├── railwayService.js         # [MEMBER 6] Data abstraction service (JSON / API)
│   │   │   └── weatherService.js         # [MEMBER 6] Atmospheric telemetry service
│   │   │
│   │   ├── data/                         # Local frontend bundle copy of Member 6 data
│   │   │   ├── railway_sections.json
│   │   │   ├── weather_data.json
│   │   │   └── environmental_risk.json
│   │   │
│   │   └── App.jsx                       # Root application mounting RailwayMap
│   │
│   └── package.json                      # Added leaflet & react-leaflet
│
├── .env.example                          # Root environment template
└── README.md                             # Comprehensive technical guide
```

---

## 4. Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.10+ (for running the synthetic data generator)

### Step 1: Install Frontend Dependencies
```powershell
# Navigate to the frontend directory
cd frontend

# Install packages (including leaflet and react-leaflet)
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` ensures smooth installation with React 19)*

### Step 2: (Optional) Re-generate Synthetic Datasets
To regenerate or customize the 32 Indian Railways sections:
```powershell
# From the project root
python scripts/generate_data.py
```
This script automatically regenerates and synchronizes both `data/` and `frontend/src/data/`.

---

## 5. Running the Application

```powershell
# In the frontend directory
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

Click on the **"GeoTrack & Satellite Map"** tab in the top navigation bar (or click **"🛰️ Open GIS Map"** on the Command Dashboard) to launch the interactive map.

---

## 6. How the Features Work

### A. OpenStreetMap Integration & Layer Switcher
- **Default Base Map**: OpenStreetMap standard vector tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Attribution**: Rendered in the bottom-right according to OSM legal guidelines.
- **Satellite Toggle**: Switch between **"Street"** and **"Satellite"** using the layer buttons on the top filter bar.
- **Resilient Fallback**: If the satellite tile server is unreachable, the system automatically catches `tileerror` and switches back to OpenStreetMap without freezing.

### B. Railway Sections & Risk Color Coding
Railway sections are drawn using Leaflet Polylines connecting real coordinates across India:
- 🟢 **LOW RISK**: Normal operating conditions (Speed limit up to 130 km/h)
- 🟡 **MEDIUM RISK**: Minor surface wear or missing clips under routine monitoring
- 🟠 **HIGH RISK**: Track maintenance block required within 48 hours
- 🔴 **CRITICAL RISK**: Severe cracks, flood threats, or landslides requiring immediate Temporary Speed Restrictions (TSR 30–60 km/h)

### C. Map Filters
- **Risk Filter**: View All, Low, Medium, High, or Critical sections.
- **Hazard Filter**: Filter by specific environmental threats (Flood, Landslide, Waterlogging, Vegetation, Extreme Weather).
- **Search Bar**: Filter sections by route name, station name, section ID, or terrain.
- **Toggles**: Enable or disable environmental hazard icons and terminus station labels.

### D. Environmental Hazard Markers
Midpoint markers highlight localized physical dangers:
- 💧 **Flood**: Riverbed scour and submerged embankments (e.g. Narmada at Bharuch, Krishna at Vijayawada).
- ⛰️ **Landslide**: Rockfall, deep Sahyadri cuttings, and slope creep (e.g. Bhor Ghat, Dasgaon cutting).
- 🌊 **Waterlogging**: Tidal backflow and inundated track circuits (e.g. Kurla-Sion creek, Vasai Creek).
- 🌳 **Vegetation**: Wild foliage infringing overhead 25kV traction lines.
- 🌧️ **Extreme Weather**: High ambient thermal stress (>52°C rail temp) triggering rail buckling risks.

### E. Section Details Telemetry Sidebar
Clicking any railway section polyline opens the right-hand inspection sidebar with:
1. **Infrastructure**: Section length, speed limit, double/triple/quadruple line, 25kV OHE status, terrain, and traffic (GMT/day).
2. **Weather**: Temperature, humidity, rainfall, wind speed, atmospheric stress condition.
3. **Environmental Risk**: Continuous 0–100 vulnerability score and hazard breakdown.
4. **Inspection Audit**: Last inspection date, active defect status, and maintenance recommendations.

---

## 7. How Other Team Members Consume Member 6's Work

| Team Member | What They Need From Member 6 | File to Consume |
| :--- | :--- | :--- |
| **Member 1 (Database)** | Complete physical track inventory (19 columns) to seed the `tracks` database table. | [data/railway_sections.csv](file:///c:/Users/HP/RailGuard_website/Railguard/data/railway_sections.csv) and [data/railway_sections.json](file:///c:/Users/HP/RailGuard_website/Railguard/data/railway_sections.json) |
| **Member 2 (Backend Integration)** | Data schemas and endpoint contracts for railway GIS, weather, and environmental routes. | `GET /api/railway/sections`<br/>`GET /api/weather/{section_id}`<br/>`GET /api/environment/{section_id}` |
| **Member 3 (Computer Vision)** | Links camera defect inspections (`defect_type`, `confidence`, `bounding_box`) to geographic sections. | `section_id` key (e.g. `SEC-NR-101`) |
| **Member 4 (Risk AI)** | Environmental risk scores (0–100), rainfall, and rail surface temperatures used in risk calculation. | [data/environmental_risk.json](file:///c:/Users/HP/RailGuard_website/Railguard/data/environmental_risk.json) & [data/weather_data.json](file:///c:/Users/HP/RailGuard_website/Railguard/data/weather_data.json) |
| **Member 5 (Frontend Lead)** | Master GIS component and navigation tab to render in the main UI. | `<RailwayMap />` in `frontend/src/components/RailwayMap.jsx` |

---

## 8. College Viva & Presentation Guide

If asked in your college viva or project evaluation:
1. **"What was your individual contribution as Member 6?"**
   > *"I engineered the geospatial, satellite mapping, and environmental data telemetry module. I integrated Leaflet and OpenStreetMap into our React architecture, mapped 32 Indian Railways sections across prominent corridors, implemented risk-colored polylines, built an environmental hazard tracking system for floods and landslides, and developed an abstracted service layer ready for future FastAPI integration."*
2. **"How does the satellite layer work without paying for API keys?"**
   > *"We integrated high-resolution satellite imagery using Esri World Imagery (ArcGIS Tile Services), which provides open high-resolution aerial tiles without requiring mandatory API keys. The system also supports configurable keys via `.env` for Mapbox or Planet Labs, and includes automatic fallback to OpenStreetMap if satellite tiles fail."*
3. **"How does this connect to the AI defect detection (Member 3)?"**
   > *"Every dataset and map polyline is keyed by a unique `section_id`. When Member 3's YOLO model identifies a rail crack from an inspection photo, the result is linked to the matching `section_id`, automatically turning that track polyline red and updating its risk telemetry."*
