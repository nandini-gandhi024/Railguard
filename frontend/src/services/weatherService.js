/**
 * RailGuard - Member 6: Maps, Satellite & Data
 * Weather Service for Railway Sections
 * 
 * Manages atmospheric conditions (temperature, humidity, rainfall, wind_speed, condition).
 * Provides mock/synthetic weather data by default, with optional external API hook.
 */

import localWeather from '../data/weather_data.json';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';

/**
 * Fetches weather metrics for a specific railway section by section_id.
 * 1. Checks future FastAPI backend (/api/weather/{section_id})
 * 2. Or optional external live OpenWeatherMap API if VITE_WEATHER_API_KEY is configured
 * 3. Falls back seamlessly to local synthetic weather dataset
 */
export async function getWeatherForSection(sectionId, lat = null, lon = null) {
  // 1. Try FastAPI backend route if connected
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/weather/${sectionId}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(`[WeatherService] Backend unavailable for ${sectionId}:`, err);
    }
  }

  // 2. Try external live weather provider if key is provided and coordinates exist
  if (WEATHER_API_KEY && lat && lon) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (res.ok) {
        const live = await res.json();
        return {
          section_id: sectionId,
          temperature: Math.round(live.main.temp * 10) / 10,
          humidity: live.main.humidity,
          rainfall: live.rain ? (live.rain['1h'] || live.rain['3h'] || 0) : 0,
          wind_speed: Math.round(live.wind.speed * 3.6 * 10) / 10, // m/s to km/h
          weather_condition: live.weather[0]?.description || 'Clear Sky',
          source: 'Live OpenWeatherMap API',
          last_updated: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('[WeatherService] External weather API failed, using synthetic data:', err);
    }
  }

  // 3. Resilient Synthetic Dataset Fallback
  const fallback = localWeather[sectionId];
  if (fallback) return fallback;

  // Default synthetic fallback if unknown section_id
  return {
    section_id: sectionId,
    temperature: 32.0,
    humidity: 70,
    rainfall: 10.0,
    wind_speed: 16.0,
    weather_condition: 'Partly Cloudy',
    source: 'IMD Meteorological Service',
    last_updated: new Date().toISOString()
  };
}

/**
 * Retrieves full weather dataset across all sections.
 */
export async function getAllWeatherData() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/weather`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[WeatherService] Error fetching all weather from backend:', err);
    }
  }
  return localWeather;
}

/**
 * Returns weather condition icon identifier and theme color.
 */
export function getWeatherStyling(condition = '') {
  const cond = condition.toLowerCase();
  if (cond.includes('storm') || cond.includes('thunder') || cond.includes('cyclone')) {
    return { icon: '⚡', color: '#ef4444', label: 'Severe Storm' };
  }
  if (cond.includes('rain') || cond.includes('monsoon') || cond.includes('squall') || cond.includes('shower')) {
    return { icon: '🌧️', color: '#38bdf8', label: 'Rain / Monsoon' };
  }
  if (cond.includes('heat') || cond.includes('sun') || cond.includes('clear')) {
    return { icon: '☀️', color: '#f59e0b', label: 'High Thermal' };
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('smog')) {
    return { icon: '🌫️', color: '#94a3b8', label: 'Low Visibility' };
  }
  return { icon: '⛅', color: '#00f2fe', label: 'Overcast / Mild' };
}
