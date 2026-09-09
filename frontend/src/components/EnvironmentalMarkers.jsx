import React from 'react';
import L from 'leaflet';

/**
 * Creates a custom hazard marker with clean category styling
 */
export function createHazardDivIcon(primaryHazard, score) {
  let iconEmoji = '⚠️';
  let badgeColor = '#b45309'; // amber

  switch (primaryHazard) {
    case 'Flood':
      iconEmoji = '💧';
      badgeColor = '#0284c7'; // blue
      break;
    case 'Landslide':
      iconEmoji = '⛰️';
      badgeColor = '#b91c1c'; // red
      break;
    case 'Waterlogging':
      iconEmoji = '🌊';
      badgeColor = '#0891b2'; // cyan
      break;
    case 'Vegetation':
      iconEmoji = '🌳';
      badgeColor = '#137333'; // green
      break;
    case 'Extreme Weather':
      iconEmoji = '🌧️';
      badgeColor = '#d97706'; // orange
      break;
    default:
      iconEmoji = '⚠️';
      badgeColor = '#b45309';
  }

  const isCritical = score >= 75;

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid ${badgeColor};
        box-shadow: 0 2px 6px rgba(0,0,0,0.18), 0 0 ${isCritical ? '8px' : '2px'} ${badgeColor};
        cursor: pointer;
      ">
        <span style="font-size: 13px; line-height: 1;">${iconEmoji}</span>
        ${isCritical ? `
          <span style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #b91c1c;
            border: 1px solid #ffffff;
            box-shadow: 0 0 4px #ef4444;
          "></span>
        ` : ''}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
}

/**
 * Creates a spatial cluster marker for multiple grouped hazards
 */
export function createHazardClusterDivIcon(count, highestScore) {
  const isCritical = highestScore >= 75;
  const badgeColor = isCritical ? '#b91c1c' : '#b45309';

  return L.divIcon({
    className: 'custom-hazard-cluster-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 3px 8px;
        border-radius: 9999px;
        background: ${isCritical ? '#fee2e2' : '#fef3c7'};
        border: 1.5px solid ${badgeColor};
        color: ${badgeColor};
        font-family: var(--font-mono, monospace);
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
        white-space: nowrap;
      ">
        <span>⚠️</span>
        <span>${count} Hazards</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
    popupAnchor: [0, -14]
  });
}

/**
 * Creates station terminal icon (clean, compact dot or label)
 */
export function createStationDivIcon(name, showLabel = true) {
  if (!showLabel) {
    return L.divIcon({
      className: 'custom-station-marker-dot',
      html: `
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #0a2540;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>
      `,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
      popupAnchor: [0, -6]
    });
  }

  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #0a2540;
        border: 1px solid #38bdf8;
        color: #ffffff;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--font-mono, monospace);
        font-size: 9px;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        white-space: nowrap;
        cursor: pointer;
      ">
        <span style="color: #38bdf8; font-size: 10px;">🚉</span>
        <span>${name}</span>
      </div>
    `,
    iconAnchor: [25, 10],
    popupAnchor: [0, -12]
  });
}

/**
 * Creates a maintenance possession block marker
 */
export function createMaintenanceDivIcon(trackId, status = 'AI Scheduled') {
  return L.divIcon({
    className: 'custom-maint-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 3px;
        background: #137333;
        border: 1.5px solid #ffffff;
        color: #ffffff;
        padding: 2px 7px;
        border-radius: 9999px;
        font-family: var(--font-mono, monospace);
        font-size: 9.5px;
        font-weight: 800;
        box-shadow: 0 2px 6px rgba(19, 115, 51, 0.4);
        cursor: pointer;
        white-space: nowrap;
      ">
        <span>🔧</span>
        <span>${trackId} Block</span>
      </div>
    `,
    iconAnchor: [30, 11],
    popupAnchor: [0, -13]
  });
}
