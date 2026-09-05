/**
 * RailGuard - Member 6: Maps, Satellite & Data
 * Railway Sections & Environmental Risk Data Service
 * 
 * Supports local synthetic data (default) and prepared for future FastAPI integration.
 */

import localSections from '../data/railway_sections.json';
import localEnvironment from '../data/environmental_risk.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Reusable risk level color mapper required by Member 6 contract:
 * LOW      → green (#10b981)
 * MEDIUM   → yellow (#eab308)
 * HIGH     → orange (#f97316)
 * CRITICAL → red (#ef4444)
 */
export function getRiskColor(riskLevel) {
  if (!riskLevel) return '#94a3b8';
  const level = String(riskLevel).toUpperCase().trim();
  switch (level) {
    case 'LOW':
      return '#10b981'; // Green
    case 'MEDIUM':
    case 'MODERATE':
      return '#eab308'; // Yellow
    case 'HIGH':
      return '#f97316'; // Orange
    case 'CRITICAL':
      return '#ef4444'; // Red
    default:
      return '#38bdf8'; // Fallback cyan
  }
}

/**
 * Environmental Risk Score color mapper (0–100 scale):
 * 0–25   = LOW (green)
 * 26–50  = MODERATE (yellow)
 * 51–75  = HIGH (orange)
 * 76–100 = CRITICAL (red)
 */
export function getEnvironmentalScoreColor(score) {
  const s = Number(score) || 0;
  if (s <= 25) return '#10b981';
  if (s <= 50) return '#eab308';
  if (s <= 75) return '#f97316';
  return '#ef4444';
}

/**
 * Fetches all railway sections.
 * Attempts FastAPI backend first if VITE_API_BASE_URL is provided,
 * otherwise transparently falls back to local synthetic JSON dataset.
 */
export async function getRailwaySections() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/railway/sections`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('[RailwayService] Live API unavailable, falling back to synthetic dataset:', err);
    }
  }
  return localSections;
}

/**
 * Fetches a single railway section by section_id.
 */
export async function getRailwaySectionById(sectionId) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/railway/sections/${sectionId}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(`[RailwayService] Error fetching section ${sectionId}:`, err);
    }
  }
  return localSections.find((s) => s.section_id === sectionId) || null;
}

/**
 * Fetches environmental risk data for all sections or a specific section_id.
 */
export async function getEnvironmentalRisk(sectionId = null) {
  if (API_BASE_URL) {
    try {
      const endpoint = sectionId 
        ? `${API_BASE_URL}/api/environment/${sectionId}`
        : `${API_BASE_URL}/api/environment`;
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[RailwayService] Error fetching environmental risk:', err);
    }
  }
  if (sectionId) {
    return localEnvironment[sectionId] || null;
  }
  return localEnvironment;
}

/**
 * Helper to filter sections by risk level, environmental hazard, or search query.
 */
export function filterRailwaySections(sections, { riskFilter = 'ALL', envFilter = 'ALL', search = '' }) {
  if (!Array.isArray(sections)) return [];

  return sections.filter((section) => {
    // 1. Risk Level Filter
    if (riskFilter !== 'ALL') {
      const secRisk = String(section.risk_level || '').toUpperCase();
      if (riskFilter === 'LOW' && secRisk !== 'LOW') return false;
      if (riskFilter === 'MEDIUM' && secRisk !== 'MEDIUM' && secRisk !== 'MODERATE') return false;
      if (riskFilter === 'HIGH' && secRisk !== 'HIGH') return false;
      if (riskFilter === 'CRITICAL' && secRisk !== 'CRITICAL') return false;
    }

    // 2. Environmental Hazard Filter
    if (envFilter !== 'ALL') {
      const envData = localEnvironment[section.section_id];
      if (!envData) return false;

      switch (envFilter) {
        case 'FLOOD':
          if (envData.flood_risk !== 'HIGH' && envData.flood_risk !== 'CRITICAL') return false;
          break;
        case 'LANDSLIDE':
          if (envData.landslide_risk !== 'HIGH' && envData.landslide_risk !== 'CRITICAL') return false;
          break;
        case 'WATERLOGGING':
          if (envData.waterlogging_risk !== 'HIGH' && envData.waterlogging_risk !== 'CRITICAL') return false;
          break;
        case 'VEGETATION':
          if (envData.vegetation_risk !== 'HIGH' && envData.vegetation_risk !== 'CRITICAL') return false;
          break;
        case 'EXTREME_WEATHER':
          if (envData.extreme_weather_risk !== 'HIGH' && envData.extreme_weather_risk !== 'CRITICAL') return false;
          break;
        default:
          break;
      }
    }

    // 3. Search Query Filter (Matches section_id, route_name, stations, terrain)
    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      const match =
        section.section_id?.toLowerCase().includes(query) ||
        section.route_name?.toLowerCase().includes(query) ||
        section.start_station?.toLowerCase().includes(query) ||
        section.end_station?.toLowerCase().includes(query) ||
        section.terrain?.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * AI Defect Integration Hook:
 * Accepts future AI inference results from Members 2, 3, or 4 and links them to railway sections.
 * Example AI payload: { section_id: "SEC-NR-101", defect_type: "crack", confidence: 0.94, severity: 85.0 }
 */
export function linkAIInspectionResult(sections, aiResult) {
  if (!aiResult || !aiResult.section_id) return sections;

  return sections.map((sec) => {
    if (sec.section_id === aiResult.section_id) {
      return {
        ...sec,
        ai_defect_type: aiResult.defect_type,
        ai_confidence: aiResult.confidence,
        ai_severity: aiResult.severity,
        ai_risk_score: aiResult.risk_score || aiResult.severity,
        defect_status: `[AI DETECTED] ${aiResult.defect_type.toUpperCase()} (Conf: ${(aiResult.confidence * 100).toFixed(0)}%)`
      };
    }
    return sec;
  });
}
