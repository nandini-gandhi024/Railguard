import React from 'react';
import L from 'leaflet';

/**
 * Creates a high-visibility pulsing custom DivIcon for Environmental Hazards
 */
export function createHazardDivIcon(primaryHazard, score) {
  let iconEmoji = '⚠️';
  let badgeColor = '#f59e0b'; // amber

  switch (primaryHazard) {
    case 'Flood':
      iconEmoji = '💧';
      badgeColor = '#38bdf8'; // blue
      break;
    case 'Landslide':
      iconEmoji = '⛰️';
      badgeColor = '#ef4444'; // red
      break;
    case 'Waterlogging':
      iconEmoji = '🌊';
      badgeColor = '#06b6d4'; // cyan
      break;
    case 'Vegetation':
      iconEmoji = '🌳';
      badgeColor = '#10b981'; // green
      break;
    case 'Extreme Weather':
      iconEmoji = '🌧️';
      badgeColor = '#f97316'; // orange
      break;
    default:
      iconEmoji = '⚠️';
      badgeColor = '#eab308';
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
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(10, 15, 29, 0.95);
        border: 2px solid ${badgeColor};
        box-shadow: 0 0 ${isCritical ? '14px' : '6px'} ${badgeColor};
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span style="font-size: 16px; line-height: 1;">${iconEmoji}</span>
        ${isCritical ? `
          <span style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ef4444;
            box-shadow: 0 0 6px #ef4444;
            animation: pulse 1.5s infinite;
          "></span>
        ` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

/**
 * Creates station terminal icon
 */
export function createStationDivIcon(name) {
  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid #00f2fe;
        color: #f8fafc;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 10px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        white-space: nowrap;
      ">
        <span style="color: #00f2fe;">🚉</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [80, 24],
    iconAnchor: [40, 12]
  });
}
