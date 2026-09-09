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
import { createHazardDivIcon, createHazardClusterDivIcon, createStationDivIcon, createMaintenanceDivIcon } from './EnvironmentalMarkers';
import {
  Maximize2,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  CalendarClock,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  Flame,
  Filter
} from 'lucide-react';
import PageHeader from './common/PageHeader';
import { RiskBadge, StatusBadge } from './common/RiskBadge';

// Fix default Leaflet marker assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tile Layer Configurations
const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> • RailGuard Geospatial';

const SATELLITE_URL = import.meta.env.VITE_SATELLITE_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS, AeroGRID, IGN';

export default function RailwayMap({ onNavigateToSimulator }) {
  // Data States
  const [sections, setSections] = useState([]);
  const [environmentalData, setEnvironmentalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Interaction States
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(5);

  // Filter & Layer Toggles
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [baseLayer, setBaseLayer] = useState('osm'); // 'osm' | 'satellite'
  const [showEnvMarkers, setShowEnvMarkers] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(true);
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [criticalView, setCriticalView] = useState(false);
  const [riskHeatmap, setRiskHeatmap] = useState(false);
  const [corridorMode, setCorridorMode] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const polylinesLayerGroupRef = useRef(null);
  const markersLayerGroupRef = useRef(null);
  const maintLayerGroupRef = useRef(null);
  const heatmapLayerGroupRef = useRef(null);

  // Sample maintenance possession windows
  const maintenanceLocations = [
    { trackId: 'T041', sectionId: 'SEC-NR-101', lat: 28.6561, lon: 77.3366, window: '01:00–03:00 IST', crew: 'Gang #7', type: 'Emergency Rail Weld' },
    { trackId: 'TRK-CR-204', sectionId: 'SEC-CR-201', lat: 19.0330, lon: 73.0297, window: '01:30–04:00 IST', crew: 'Gang #12', type: 'PSC Sleeper Renewal' },
    { trackId: 'TRK-ER-405', sectionId: 'SEC-ER-401', lat: 23.4500, lon: 87.3500, window: '02:00–04:00 IST', crew: 'Gang #4', type: 'Ballast Deep Screening' }
  ];

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

        // Auto-select first critical section for immediate insight
        const critical = secData.find((s) => s.risk_level === 'CRITICAL') || secData[0];
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

    const clockInterval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tile = L.tileLayer(OSM_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tile;
    polylinesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    maintLayerGroupRef.current = L.layerGroup().addTo(map);
    heatmapLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Track zoom level changes dynamically
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Handle Base Layer Switching (OSM vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    if (baseLayer === 'satellite') {
      const satelliteTile = L.tileLayer(SATELLITE_URL, {
        attribution: SATELLITE_ATTRIBUTION,
        maxZoom: 18
      });

      satelliteTile.on('tileerror', () => {
        console.warn('[RailwayMap] Satellite tiles unavailable, fallback to OpenStreetMap.');
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
      riskFilter: criticalView ? 'CRITICAL' : riskFilter,
      envFilter,
      search: searchQuery
    });
  }, [sections, riskFilter, envFilter, searchQuery, criticalView]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: sections.length || 32,
      critical: sections.filter((s) => s.risk_level === 'CRITICAL').length || 8,
      high: sections.filter((s) => s.risk_level === 'HIGH').length || 6,
      medium: sections.filter((s) => s.risk_level === 'MEDIUM' || s.risk_level === 'MODERATE').length || 10,
      low: sections.filter((s) => s.risk_level === 'LOW').length || 8
    };
  }, [sections]);

  // 5. Select Section Handler
  const handleSelectSection = async (section, envLookup = environmentalData) => {
    setSelectedSection(section);
    const env = envLookup[section.section_id] || null;
    setSelectedEnv(env);

    const w = await getWeatherForSection(section.section_id, section.latitude, section.longitude);
    setSelectedWeather(w);
  };

  const handleFocusOnMap = (section) => {
    if (!mapInstanceRef.current || !section) return;
    const map = mapInstanceRef.current;

    const bounds = L.latLngBounds([
      [section.start_latitude, section.start_longitude],
      [section.end_latitude, section.end_longitude]
    ]);

    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10, animate: true });
  };

  const handleFitAllCorridors = () => {
    if (!mapInstanceRef.current || filteredSections.length === 0) return;
    const map = mapInstanceRef.current;

    const allPoints = [];
    filteredSections.forEach((s) => {
      if (isValidCoord(s.start_latitude, s.start_longitude)) {
        allPoints.push([s.start_latitude, s.start_longitude]);
      }
      if (isValidCoord(s.end_latitude, s.end_longitude)) {
        allPoints.push([s.end_latitude, s.end_longitude]);
      }
    });

    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], animate: true });
    }
  };

  function isValidCoord(lat, lon) {
    return (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  // 6. Draw Layers: Polylines, Heatmap, Stations, Hazards, Maintenance
  useEffect(() => {
    if (!mapInstanceRef.current || !polylinesLayerGroupRef.current || !markersLayerGroupRef.current || !maintLayerGroupRef.current || !heatmapLayerGroupRef.current) return;

    const polylinesLayer = polylinesLayerGroupRef.current;
    const markersLayer = markersLayerGroupRef.current;
    const maintLayer = maintLayerGroupRef.current;
    const heatmapLayer = heatmapLayerGroupRef.current;

    polylinesLayer.clearLayers();
    markersLayer.clearLayers();
    maintLayer.clearLayers();
    heatmapLayer.clearLayers();

    // ── 6A. DRAW RISK HEATMAP BUFFERS (IF ENABLED) ──
    if (riskHeatmap) {
      filteredSections.forEach((sec) => {
        if (sec.risk_level === 'CRITICAL' || sec.risk_level === 'HIGH') {
          if (isValidCoord(sec.latitude, sec.longitude)) {
            const isCrit = sec.risk_level === 'CRITICAL';
            const circle = L.circle([sec.latitude, sec.longitude], {
              radius: isCrit ? 45000 : 25000,
              color: 'transparent',
              fillColor: isCrit ? '#ef4444' : '#f59e0b',
              fillOpacity: isCrit ? 0.22 : 0.15
            });
            heatmapLayer.addLayer(circle);
          }
        }
      });
    }

    // ── 6B. DRAW RAILWAY TRACK POLYLINES ──
    if (showRiskLayer !== false) {
      filteredSections.forEach((sec) => {
        if (!isValidCoord(sec.start_latitude, sec.start_longitude) || !isValidCoord(sec.end_latitude, sec.end_longitude)) {
          return;
        }

        const isSelected = selectedSection?.section_id === sec.section_id;
        const isCritical = sec.risk_level === 'CRITICAL';
        const isHigh = sec.risk_level === 'HIGH';
        const riskColor = getRiskColor(sec.risk_level);

        // Critical View dimming logic: dim safe sections if Critical View is ON
        if (criticalView && !isCritical && !isHigh) {
          return; // Hide low risk in Critical View
        }

        const points = sec.coordinates || [
          [sec.start_latitude, sec.start_longitude],
          [sec.latitude, sec.longitude],
          [sec.end_latitude, sec.end_longitude]
        ];

        // Background halo/casing for selected or critical sections
        if (isSelected || isCritical) {
          const casing = L.polyline(points, {
            color: isCritical ? '#ef4444' : '#0a2540',
            weight: isSelected ? 12 : 9,
            opacity: isSelected ? 0.45 : 0.25,
            lineCap: 'round',
            lineJoin: 'round'
          });
          polylinesLayer.addLayer(casing);
        }

        const polyline = L.polyline(points, {
          color: riskColor,
          weight: isSelected ? 7 : (isCritical ? 5.5 : 4.5),
          opacity: isSelected ? 1.0 : (isCritical ? 0.95 : 0.85),
          dashArray: isCritical ? '6, 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // SMART COMPACT TOOLTIP / POPUP
        const trackId = sec.track_id || sec.section_id.replace('SEC-', 'TRK-') || 'T041';
        const popupHTML = `
          <div style="font-family: var(--font-sans, sans-serif); font-size: 11px; min-width: 190px; color: #0f172a; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 900; font-family: monospace; color: #0a2540; font-size: 12px;">${trackId}</span>
              <span style="background: ${isCritical ? '#fee2e2' : (isHigh ? '#fef3c7' : '#e6f4ea')}; color: ${isCritical ? '#b91c1c' : (isHigh ? '#b45309' : '#137333')}; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">
                ${sec.risk_level} RISK
              </span>
            </div>
            <div style="font-weight: 700; font-size: 12px; margin-bottom: 2px; color: #0f172a;">
              ${sec.route_name}
            </div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
              ${sec.start_station} → ${sec.end_station}
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span>Critical in: <strong style="color: ${isCritical ? '#b91c1c' : '#0f172a'};">${isCritical ? '2 days' : '14 days'}</strong></span>
              <span style="color: #1d4ed8; font-weight: 800; cursor: pointer;">View Details →</span>
            </div>
          </div>
        `;

        polyline.bindPopup(popupHTML);

        polyline.on('click', () => {
          handleSelectSection(sec);
        });

        polylinesLayer.addLayer(polyline);
      });
    }

    // ── 6C. DRAW STATIONS (ZOOM DEPENDENT: DOT AT LOW ZOOM, LABEL AT HIGH ZOOM) ──
    if (showStations && !criticalView) {
      const showLabels = currentZoom >= 8;

      filteredSections.forEach((sec) => {
        if (isValidCoord(sec.start_latitude, sec.start_longitude)) {
          const startStationMarker = L.marker([sec.start_latitude, sec.start_longitude], {
            icon: createStationDivIcon(sec.start_station.split('(')[0].trim(), showLabels),
            zIndexOffset: 100
          });
          startStationMarker.bindPopup(`<b>Station:</b> ${sec.start_station}<br/><b>Corridor:</b> ${sec.route_name}`);
          markersLayer.addLayer(startStationMarker);
        }

        if (isValidCoord(sec.end_latitude, sec.end_longitude)) {
          const endStationMarker = L.marker([sec.end_latitude, sec.end_longitude], {
            icon: createStationDivIcon(sec.end_station.split('(')[0].trim(), showLabels),
            zIndexOffset: 100
          });
          endStationMarker.bindPopup(`<b>Station:</b> ${sec.end_station}<br/><b>Corridor:</b> ${sec.route_name}`);
          markersLayer.addLayer(endStationMarker);
        }
      });
    }

    // ── 6D. DRAW MAINTENANCE POSSESSION MARKERS ──
    if (showMaintenance) {
      maintenanceLocations.forEach((m) => {
        const maintMarker = L.marker([m.lat, m.lon], {
          icon: createMaintenanceDivIcon(m.trackId),
          zIndexOffset: 300
        });

        const maintPopupHTML = `
          <div style="font-family: var(--font-sans, sans-serif); font-size: 11px; min-width: 190px; color: #0f172a;">
            <div style="font-weight: 800; color: #137333; margin-bottom: 2px;">
              🔧 Maintenance Block: ${m.trackId}
            </div>
            <div style="font-size: 10px; color: #334155;"><b>Work:</b> ${m.type}</div>
            <div style="font-size: 10px; color: #334155;"><b>Window:</b> ${m.window}</div>
            <div style="font-size: 10px; color: #334155;"><b>Crew:</b> ${m.crew}</div>
            <div style="font-size: 10px; color: #137333; font-weight: bold; margin-top: 4px;">✓ AI Scheduled Possession</div>
          </div>
        `;

        maintMarker.bindPopup(maintPopupHTML);
        maintLayer.addLayer(maintMarker);
      });
    }

    // ── 6E. DRAW ENVIRONMENTAL HAZARD MARKERS (WITH SPATIAL CLUSTERING AT LOW ZOOM) ──
    if (showEnvMarkers) {
      if (currentZoom < 7) {
        // Spatial Cluster Grouping: Group hazards by region
        const hazardClusterMap = {};
        filteredSections.forEach((sec) => {
          const env = environmentalData[sec.section_id];
          if (env && env.primary_hazard && env.primary_hazard !== 'None') {
            const key = `${Math.round(sec.latitude)}_${Math.round(sec.longitude)}`;
            if (!hazardClusterMap[key]) {
              hazardClusterMap[key] = { lat: sec.latitude, lon: sec.longitude, count: 0, highestScore: 0, items: [] };
            }
            hazardClusterMap[key].count++;
            hazardClusterMap[key].highestScore = Math.max(hazardClusterMap[key].highestScore, env.environmental_risk_score);
            hazardClusterMap[key].items.push(sec);
          }
        });

        Object.values(hazardClusterMap).forEach((c) => {
          const clusterMarker = L.marker([c.lat, c.lon], {
            icon: createHazardClusterDivIcon(c.count, c.highestScore),
            zIndexOffset: 250
          });
          clusterMarker.bindPopup(`<b>Environmental Hazard Cluster:</b> ${c.count} hazards in region.<br/><i>Zoom in to view specific locations.</i>`);
          markersLayer.addLayer(clusterMarker);
        });
      } else {
        // Individual Hazard Markers at Detailed Zoom
        filteredSections.forEach((sec) => {
          if (isValidCoord(sec.latitude, sec.longitude)) {
            const env = environmentalData[sec.section_id];
            if (env && env.primary_hazard && env.primary_hazard !== 'None') {
              const hazardIcon = createHazardDivIcon(env.primary_hazard, env.environmental_risk_score);
              const hazardMarker = L.marker([sec.latitude, sec.longitude], {
                icon: hazardIcon,
                zIndexOffset: 200
              });

              const hazardPopupHTML = `
                <div style="font-family: var(--font-sans, sans-serif); font-size: 11px; min-width: 200px; color: #0f172a;">
                  <div style="font-weight: 800; color: #b45309; font-size: 12px; margin-bottom: 2px;">
                    ⚠️ ${env.primary_hazard} Hazard (${env.environmental_risk_score}/100)
                  </div>
                  <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">
                    <b>Corridor:</b> ${sec.section_id} (${sec.route_name})
                  </div>
                  <div style="font-size: 10px; color: #1e293b; background: #f8fafc; padding: 4px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    ${env.hazard_description}
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
      }
    }
  }, [filteredSections, environmentalData, selectedSection, showEnvMarkers, showStations, showMaintenance, showRiskLayer, criticalView, riskHeatmap, currentZoom]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* ── 1. HEADER ── */}
      <PageHeader
        title="Railway Track Map"
        subtitle="Real-time view of track condition, risk, maintenance and environmental hazards across Indian Railways corridors."
        icon={MapPin}
        badgeText="Railway Asset Map"
        badgeType="navy"
        breadcrumbs={['RailGuard Ops', 'Geospatial', 'Track Map']}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#e6f4ea',
                border: '1px solid #a7f3d0',
                color: '#137333',
                padding: '4px 10px',
                borderRadius: 9999,
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Radio size={13} className="animate-pulse text-emerald-600" />
              <span>GIS Feed Live</span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        }
      />

      {/* ── 2. RAILWAY-CORRIDOR SUMMARY STRIP ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: '0.8125rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Corridors: </span>
            <strong style={{ color: 'var(--ir-navy-dark)', fontFamily: 'var(--font-mono)' }}>{stats.total} Active</strong>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--border-light)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Critical: </span>
            <strong style={{ color: '#b91c1c', fontFamily: 'var(--font-mono)' }}>{stats.critical} Red</strong>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--border-light)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>High Risk: </span>
            <strong style={{ color: '#b45309', fontFamily: 'var(--font-mono)' }}>{stats.high} Amber</strong>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--border-light)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Maintenance Blocks: </span>
            <strong style={{ color: 'var(--ir-green)', fontFamily: 'var(--font-mono)' }}>12 Scheduled</strong>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--border-light)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Asset Availability: </span>
            <strong style={{ color: 'var(--ir-green)', fontFamily: 'var(--font-mono)' }}>96.5%</strong>
          </div>
        </div>

        {/* Workflow & Prototype badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: 'var(--ir-navy-dark)',
              background: 'var(--ir-navy-soft)',
              padding: '2px 8px',
              borderRadius: 4
            }}
          >
            DETECT → PREDICT → OPTIMIZE → PROTECT
          </div>

        </div>
      </div>

      {/* ── 3. MAP CONTROL BAR ── */}
      <MapFilters
        sections={sections}
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
        showMaintenance={showMaintenance}
        setShowMaintenance={setShowMaintenance}
        showRiskLayer={showRiskLayer}
        setShowRiskLayer={setShowRiskLayer}
        criticalView={criticalView}
        setCriticalView={setCriticalView}
        riskHeatmap={riskHeatmap}
        setRiskHeatmap={setRiskHeatmap}
        corridorMode={corridorMode}
        setCorridorMode={setCorridorMode}
        stats={stats}
        onResetFilters={() => {
          setRiskFilter('ALL');
          setEnvFilter('ALL');
          setSearchQuery('');
          setCriticalView(false);
          setRiskHeatmap(false);
          setCorridorMode(false);
        }}
        onFitAll={handleFitAllCorridors}
        onSelectTrack={(sec) => {
          handleSelectSection(sec);
          handleFocusOnMap(sec);
        }}
      />

      {/* ── 4. MAIN MAP + SIDE PANEL WORKSPACE ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '14px',
          minHeight: '680px'
        }}
      >
        {/* MAP CONTAINER (75% WIDTH WORKSPACE) */}
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            background: '#e2e8f0',
            height: '680px'
          }}
        >
          {/* Leaflet Map Canvas */}
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%', outline: 'none' }}
          />

          {/* Floating Map Legend (Bottom Left) */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 400 }}>
            <MapLegend
              activeRiskFilter={riskFilter}
              onSelectRiskFilter={(lvl) => setRiskFilter(lvl)}
            />
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 500,
                gap: 10
              }}
            >
              <div style={{ width: 32, height: 32, border: '3px solid var(--ir-navy-dark)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ir-navy-dark)' }}>
                Loading Indian Railways Geospatial Corridors...
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE PANEL (25–30% WIDTH) */}
        <div style={{ height: '680px' }}>
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
            /* CORRIDOR RISK INTELLIGENCE FEED (WHEN NO TRACK IS SELECTED) */
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ShieldAlert size={16} color="var(--ir-navy-dark)" />
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--ir-navy-dark)', textTransform: 'uppercase' }}>
                    Corridor Risk Intelligence Feed
                  </h3>
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                  Click any corridor polyline or select from the high-priority risk queue below.
                </p>

                {/* List of high-priority corridors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '540px', overflowY: 'auto' }}>
                  {filteredSections.slice(0, 8).map((sec) => {
                    const isCrit = sec.risk_level === 'CRITICAL';
                    return (
                      <div
                        key={sec.section_id}
                        onClick={() => handleSelectSection(sec)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: `1px solid ${isCrit ? '#fca5a5' : 'var(--border-light)'}`,
                          background: isCrit ? '#fef2f2' : 'var(--bg-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.12s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.75rem', color: isCrit ? '#b91c1c' : 'var(--ir-navy-dark)' }}>
                            {sec.section_id}
                          </span>
                          <RiskBadge value={sec.risk_level} category={`${sec.risk_level} RISK`} size="sm" />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                          {sec.route_name}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {sec.start_station} → {sec.end_station}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10, fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Select a section to inspect 7d/14d risk forecasts & bypass routes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
