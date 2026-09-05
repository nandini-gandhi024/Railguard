import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  getRailwaySections, 
  getEnvironmentalRisk, 
  getRiskColor, 
  filterRailwaySections 
} from '../services/railwayService';
import { getWeatherForSection } from '../services/weatherService';
import MapFilters from './MapFilters';
import MapLegend from './MapLegend';
import SectionDetails from './SectionDetails';
import { createHazardDivIcon, createStationDivIcon } from './EnvironmentalMarkers';
import { Maximize2, AlertTriangle, Radio } from 'lucide-react';

// Fix default Leaflet marker assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tile Layer Configurations
const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • RailGuard Geospatial';

// Configurable Satellite tile provider with zero hardcoding
const SATELLITE_URL = import.meta.env.VITE_SATELLITE_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN, and the GIS User Community';

export default function RailwayMap({ onNavigateToSimulator }) {
  // Data States
  const [sections, setSections] = useState([]);
  const [environmentalData, setEnvironmentalData] = useState({});
  const [loading, setLoading] = useState(true);

  // Interaction States
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);

  // Filter States
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [baseLayer, setBaseLayer] = useState('osm'); // 'osm' | 'satellite'
  const [showEnvMarkers, setShowEnvMarkers] = useState(true);
  const [showStations, setShowStations] = useState(true);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const polylinesLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);

  // 1. Ingest Data on Component Mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [secData, envData] = await Promise.all([
          getRailwaySections(),
          getEnvironmentalRisk()
        ]);
        setSections(secData);
        setEnvironmentalData(envData);

        // Auto-select first critical or high-risk section for immediate insight
        const critical = secData.find(s => s.risk_level === 'CRITICAL') || secData[0];
        if (critical) {
          handleSelectSection(critical, envData);
        }
      } catch (err) {
        console.error('[RailwayMap] Error loading map datasets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Pan-India geographic center [22.5, 79.5]
    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false // Custom position below
    });

    // Add zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Primary Base Tile Layer
    const tile = L.tileLayer(OSM_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tile;

    // Layer Groups for dynamic redraws
    polylinesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Handle Base Layer Switching (OpenStreetMap vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    if (baseLayer === 'satellite') {
      const satelliteTile = L.tileLayer(SATELLITE_URL, {
        attribution: SATELLITE_ATTRIBUTION,
        maxZoom: 18
      });

      // Error event fallback: if satellite fails to load, fall back to OSM
      satelliteTile.on('tileerror', () => {
        console.warn('[RailwayMap] Satellite tiles unavailable. Falling back to OpenStreetMap.');
        setBaseLayer('osm');
      });

      satelliteTile.addTo(map);
      tileLayerRef.current = satelliteTile;
    } else {
      const osmTile = L.tileLayer(OSM_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = osmTile;
    }
  }, [baseLayer]);

  // 4. Compute Filtered Sections
  const filteredSections = useMemo(() => {
    return filterRailwaySections(sections, {
      riskFilter,
      envFilter,
      search: searchQuery
    });
  }, [sections, riskFilter, envFilter, searchQuery]);

  // Section Statistics
  const stats = useMemo(() => {
    return {
      total: sections.length,
      critical: sections.filter(s => s.risk_level === 'CRITICAL').length,
      high: sections.filter(s => s.risk_level === 'HIGH').length,
      medium: sections.filter(s => s.risk_level === 'MEDIUM').length,
      low: sections.filter(s => s.risk_level === 'LOW').length
    };
  }, [sections]);

  // 5. Select Section and Retrieve Weather Asynchronously
  const handleSelectSection = async (section, envLookup = environmentalData) => {
    setSelectedSection(section);
    const env = envLookup[section.section_id] || null;
    setSelectedEnv(env);

    // Asynchronous weather retrieval
    const w = await getWeatherForSection(section.section_id, section.latitude, section.longitude);
    setSelectedWeather(w);
  };

  // Focus and Zoom onto a specific railway section
  const handleFocusOnMap = (section) => {
    if (!mapInstanceRef.current || !section) return;
    const map = mapInstanceRef.current;

    const bounds = L.latLngBounds([
      [section.start_latitude, section.start_longitude],
      [section.end_latitude, section.end_longitude]
    ]);

    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 10, animate: true });
  };

  // Reset View to fit all Indian Railway corridors
  const handleFitAllCorridors = () => {
    if (!mapInstanceRef.current || filteredSections.length === 0) return;
    const map = mapInstanceRef.current;

    const allPoints = [];
    filteredSections.forEach(s => {
      if (isValidCoord(s.start_latitude, s.start_longitude)) {
        allPoints.push([s.start_latitude, s.start_longitude]);
      }
      if (isValidCoord(s.end_latitude, s.end_longitude)) {
        allPoints.push([s.end_latitude, s.end_longitude]);
      }
    });

    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], animate: true });
    }
  };

  // Safe Coordinate Validator (Requirement 16)
  function isValidCoord(lat, lon) {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  // 6. Draw Polylines and Markers on Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current || !polylinesLayerGroupRef.current || !markersLayerGroupRef.current) return;

    const polylinesLayer = polylinesLayerGroupRef.current;
    const markersLayer = markersLayerGroupRef.current;

    polylinesLayer.clearLayers();
    markersLayer.clearLayers();

    filteredSections.forEach((sec) => {
      // Validate GPS coordinates
      if (!isValidCoord(sec.start_latitude, sec.start_longitude) || !isValidCoord(sec.end_latitude, sec.end_longitude)) {
        console.warn(`[RailwayMap] Skipping invalid GPS in section ${sec.section_id}`);
        return;
      }

      const riskColor = getRiskColor(sec.risk_level);
      const isSelected = selectedSection?.section_id === sec.section_id;
      const isCritical = sec.risk_level === 'CRITICAL';

      // 1. Draw Polyline Route
      const points = sec.coordinates || [
        [sec.start_latitude, sec.start_longitude],
        [sec.latitude, sec.longitude],
        [sec.end_latitude, sec.end_longitude]
      ];

      const polyline = L.polyline(points, {
        color: riskColor,
        weight: isSelected ? 8 : (isCritical ? 6 : 5),
        opacity: isSelected ? 1.0 : (isCritical ? 0.95 : 0.85),
        dashArray: isCritical ? '6, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Interactive Popup for Route Polyline
      const popupHTML = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 200px; color: #0f172a;">
          <div style="font-weight: 800; font-family: monospace; color: #0284c7; margin-bottom: 2px;">
            ${sec.section_id} • <span style="color: ${riskColor}; font-weight: bold;">${sec.risk_level} RISK</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">
            ${sec.route_name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            ${sec.start_station} → ${sec.end_station} (${sec.track_length_km} KM)
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 11px;">
            <div><b>Terrain:</b> ${sec.terrain}</div>
            <div><b>Track Type:</b> ${sec.track_type}</div>
            <div><b>Electrified:</b> ${sec.electrified ? '25kV AC OHE' : 'No'}</div>
            <div><b>Defect:</b> <span style="color: #b91c1c;">${sec.defect_status}</span></div>
            <div><b>Inspected:</b> ${sec.last_inspection_date}</div>
          </div>
        </div>
      `;

      polyline.bindPopup(popupHTML);

      // Polyline Event Listeners
      polyline.on('click', () => {
        handleSelectSection(sec);
      });

      polyline.on('mouseover', (e) => {
        const layer = e.target;
        layer.setStyle({ weight: 9, opacity: 1.0 });
      });

      polyline.on('mouseout', (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: isSelected ? 8 : (isCritical ? 6 : 5),
          opacity: isSelected ? 1.0 : (isCritical ? 0.95 : 0.85)
        });
      });

      polylinesLayer.addLayer(polyline);

      // 2. Draw Terminus Station Markers
      if (showStations) {
        const startStationMarker = L.marker([sec.start_latitude, sec.start_longitude], {
          icon: createStationDivIcon(sec.start_station.split('(')[0].trim()),
          zIndexOffset: 100
        });
        startStationMarker.bindPopup(`<b>Station:</b> ${sec.start_station}<br/><b>Section:</b> ${sec.section_id}`);
        markersLayer.addLayer(startStationMarker);

        const endStationMarker = L.marker([sec.end_latitude, sec.end_longitude], {
          icon: createStationDivIcon(sec.end_station.split('(')[0].trim()),
          zIndexOffset: 100
        });
        endStationMarker.bindPopup(`<b>Station:</b> ${sec.end_station}<br/><b>Section:</b> ${sec.section_id}`);
        markersLayer.addLayer(endStationMarker);
      }

      // 3. Draw Environmental Hazard Markers at Midpoint
      if (showEnvMarkers && isValidCoord(sec.latitude, sec.longitude)) {
        const env = environmentalData[sec.section_id];
        if (env && env.primary_hazard && env.primary_hazard !== 'None') {
          const hazardIcon = createHazardDivIcon(env.primary_hazard, env.environmental_risk_score);
          const hazardMarker = L.marker([sec.latitude, sec.longitude], {
            icon: hazardIcon,
            zIndexOffset: 200
          });

          const hazardPopupHTML = `
            <div style="font-family: sans-serif; font-size: 12px; min-width: 220px; color: #0f172a;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 800; color: #b45309; font-size: 13px;">
                  ⚠️ ${env.primary_hazard} Hazard
                </span>
                <span style="font-family: monospace; font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">
                  Score: ${env.environmental_risk_score}/100
                </span>
              </div>
              <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
                <b>Section:</b> ${sec.section_id} (${sec.route_name})
              </div>
              <div style="font-size: 11px; color: #1e293b; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 6px;">
                ${env.hazard_description}
              </div>
              <div style="font-size: 10px; color: #64748b;">
                Click section on map to view full weather and geometry telemetry.
              </div>
            </div>
          `;

          hazardMarker.bindPopup(hazardPopupHTML);

          hazardMarker.on('click', () => {
            handleSelectSection(sec);
          });

          markersLayer.addLayer(hazardMarker);
        }
      }
    });
  }, [filteredSections, environmentalData, selectedSection, showEnvMarkers, showStations]);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">🛰️</span>
              RailGuard Geospatial & Environmental Telemetry Map
            </h2>
            <span className="badge badge-low text-[10px]">Member 6 Module</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Indian Railways route visualization, OpenStreetMap + Satellite imagery, weather stress indicators, and environmental risk telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleFitAllCorridors}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Fit view to show all Indian railway corridors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fit All Corridors</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">GIS Feed:</span>
            <span className="text-emerald-400 font-semibold">{filteredSections.length} Sections Live</span>
          </div>
        </div>
      </div>

      {/* 2. Top Interactive Filters Component */}
      <MapFilters
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        envFilter={envFilter}
        setEnvFilter={setEnvFilter}
        baseLayer={baseLayer}
        setBaseLayer={setBaseLayer}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showEnvMarkers={showEnvMarkers}
        setShowEnvMarkers={setShowEnvMarkers}
        showStations={showStations}
        setShowStations={setShowStations}
        stats={stats}
        onResetFilters={() => {
          setRiskFilter('ALL');
          setEnvFilter('ALL');
          setSearchQuery('');
        }}
      />

      {/* 3. Main Map Canvas Grid (8 cols Map + 4 cols Section Details Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative min-h-[620px]">
        {/* Map Viewport (8 Columns) */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 flex flex-col">
          {/* Leaflet Container Element */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[620px] z-0 focus:outline-none"
            style={{ background: '#090d16' }}
          />

          {/* Floating Map Legend Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-[400] max-w-[280px]">
            <MapLegend
              activeRiskFilter={riskFilter}
              onSelectRiskFilter={(lvl) => setRiskFilter(lvl)}
            />
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-[500] backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-cyan-300">
                  Loading Indian Railways Geographic Corridors...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section Details Telemetry Sidebar (4 Columns) */}
        <div className="lg:col-span-4 h-[620px]">
          {selectedSection ? (
            <SectionDetails
              section={selectedSection}
              weather={selectedWeather}
              environmental={selectedEnv}
              onClose={() => setSelectedSection(null)}
              onFocusOnMap={handleFocusOnMap}
              onNavigateToSimulator={onNavigateToSimulator}
            />
          ) : (
            <div className="glass-card h-full p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/80 flex items-center justify-center border border-slate-800 text-2xl">
                🛤️
              </div>
              <h3 className="text-sm font-bold text-white">No Track Section Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Click any railway corridor polyline or hazard marker on the interactive map to inspect real-time telemetry, weather conditions, and environmental vulnerability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
