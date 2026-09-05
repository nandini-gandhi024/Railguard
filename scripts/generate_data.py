#!/usr/bin/env python3
"""
RailGuard - Member 6: Maps, Satellite & Data
Synthetic Railway, Weather & Environmental Data Generator
Smart India Hackathon (SIH 2026)
"""

import json
import csv
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DATA_DIR = BASE_DIR / "frontend" / "src" / "data"

# Ensure target directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)

# 32 Realistic Indian Railways Sections
SECTIONS = [
    # --- NORTHERN RAILWAY (NR) - Delhi-Kanpur Mainline (High Density) ---
    {
        "section_id": "SEC-NR-101",
        "route_name": "NDLS-CNB Golden Corridor",
        "start_station": "New Delhi (NDLS)",
        "end_station": "Ghaziabad Jn (GZB)",
        "start_latitude": 28.6429,
        "start_longitude": 77.2195,
        "end_latitude": 28.6692,
        "end_longitude": 77.4538,
        "track_length_km": 28.4,
        "track_type": "Quadruple Broad Gauge (1676mm)",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Gangetic Alluvial Plain",
        "risk_level": "CRITICAL",
        "defect_status": "Transverse Fatigue Crack at KM 14.2",
        "last_inspection_date": "2026-08-28",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 62,
        "weather": {
            "temperature": 42.4,
            "humidity": 68,
            "rainfall": 12.0,
            "wind_speed": 22.5,
            "weather_condition": "Severe Heatwave & Smog"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 82,
            "primary_hazard": "Extreme Weather",
            "hazard_description": "High thermal rail expansion stress (>54°C surface temp). Risk of lateral track buckling near Yamuna approach."
        }
    },
    {
        "section_id": "SEC-NR-102",
        "route_name": "NDLS-CNB Golden Corridor",
        "start_station": "Ghaziabad Jn (GZB)",
        "end_station": "Aligarh Jn (ALJN)",
        "start_latitude": 28.6692,
        "start_longitude": 77.4538,
        "end_latitude": 27.8974,
        "end_longitude": 78.0880,
        "track_length_km": 106.1,
        "track_type": "Triple Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Gangetic Alluvial Plain",
        "risk_level": "LOW",
        "defect_status": "Operational - No Defect",
        "last_inspection_date": "2026-09-01",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 48,
        "weather": {
            "temperature": 38.0,
            "humidity": 62,
            "rainfall": 0.0,
            "wind_speed": 14.0,
            "weather_condition": "Clear Sky"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 22,
            "primary_hazard": "None",
            "hazard_description": "Stable embankment conditions. Low environmental disturbance."
        }
    },
    {
        "section_id": "SEC-NR-103",
        "route_name": "NDLS-CNB Golden Corridor",
        "start_station": "Aligarh Jn (ALJN)",
        "end_station": "Tundla Jn (TDL)",
        "start_latitude": 27.8974,
        "start_longitude": 78.0880,
        "end_latitude": 27.2084,
        "end_longitude": 78.2435,
        "track_length_km": 78.5,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Semi-Arid Alluvium",
        "risk_level": "HIGH",
        "defect_status": "Ballast Scour and Sleeper Spalling",
        "last_inspection_date": "2026-08-20",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 58,
        "weather": {
            "temperature": 39.5,
            "humidity": 58,
            "rainfall": 28.5,
            "wind_speed": 26.0,
            "weather_condition": "Monsoon Thunderstorm"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 68,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Inadequate drainage along KM 192 bridge abutment causing ballast subgrade softening."
        }
    },
    {
        "section_id": "SEC-NR-104",
        "route_name": "NDLS-CNB Golden Corridor",
        "start_station": "Tundla Jn (TDL)",
        "end_station": "Etawah Jn (ETW)",
        "start_latitude": 27.2084,
        "start_longitude": 78.2435,
        "end_latitude": 26.7769,
        "end_longitude": 79.0270,
        "track_length_km": 92.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Ravine & Alluvial Border",
        "risk_level": "MEDIUM",
        "defect_status": "Fastener Dislocation (Missing Clips)",
        "last_inspection_date": "2026-08-25",
        "speed_limit_kmh": 120,
        "traffic_gmt_per_day": 54,
        "weather": {
            "temperature": 36.2,
            "humidity": 75,
            "rainfall": 15.0,
            "wind_speed": 16.0,
            "weather_condition": "Humid / Overcast"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 46,
            "primary_hazard": "Vegetation",
            "hazard_description": "Dense Chambal river basin wild shrub growth encroaching within overhead clearance."
        }
    },
    {
        "section_id": "SEC-NR-105",
        "route_name": "NDLS-CNB Golden Corridor",
        "start_station": "Etawah Jn (ETW)",
        "end_station": "Kanpur Central (CNB)",
        "start_latitude": 26.7769,
        "start_longitude": 79.0270,
        "end_latitude": 26.4539,
        "end_longitude": 80.3512,
        "track_length_km": 139.2,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Gangetic Alluvial Basin",
        "risk_level": "CRITICAL",
        "defect_status": "Severe Rail Corrugation & Head Check",
        "last_inspection_date": "2026-08-18",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 66,
        "weather": {
            "temperature": 37.8,
            "humidity": 82,
            "rainfall": 64.0,
            "wind_speed": 34.0,
            "weather_condition": "Heavy Monsoon Downpour"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 88,
            "primary_hazard": "Flood",
            "hazard_description": "Ganga river basin overflow inundating low-lying embankment near KM 412; critical track wash risk."
        }
    },

    # --- NORTHERN RAILWAY (NR) - Delhi-Ambala-Chandigarh ---
    {
        "section_id": "SEC-NR-106",
        "route_name": "NDLS-KLK Northern Trunk",
        "start_station": "Subzi Mandi (SZM)",
        "end_station": "Panipat Jn (PNP)",
        "start_latitude": 28.6667,
        "start_longitude": 77.1983,
        "end_latitude": 29.3909,
        "end_longitude": 76.9635,
        "track_length_km": 89.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Fertile Plains",
        "risk_level": "LOW",
        "defect_status": "Operational - Normal",
        "last_inspection_date": "2026-08-30",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 40,
        "weather": {
            "temperature": 35.0,
            "humidity": 60,
            "rainfall": 0.0,
            "wind_speed": 12.0,
            "weather_condition": "Partly Cloudy"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 15,
            "primary_hazard": "None",
            "hazard_description": "Dry trackbed, properly tamped ballast shoulder."
        }
    },
    {
        "section_id": "SEC-NR-107",
        "route_name": "NDLS-KLK Northern Trunk",
        "start_station": "Panipat Jn (PNP)",
        "end_station": "Ambala Cantt (UMB)",
        "start_latitude": 29.3909,
        "start_longitude": 76.9635,
        "end_latitude": 30.3609,
        "end_longitude": 76.8340,
        "track_length_km": 109.5,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Ghaggar Floodplain",
        "risk_level": "HIGH",
        "defect_status": "Bridge Pier Scour at Ghaggar Crossing",
        "last_inspection_date": "2026-08-22",
        "speed_limit_kmh": 100,
        "traffic_gmt_per_day": 48,
        "weather": {
            "temperature": 32.5,
            "humidity": 88,
            "rainfall": 75.5,
            "wind_speed": 38.0,
            "weather_condition": "Severe Monsoon Rain"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 85,
            "primary_hazard": "Flood",
            "hazard_description": "Ghaggar river flash flooding warning; high water velocity threatening foundation of Rail Bridge #48."
        }
    },
    {
        "section_id": "SEC-NR-108",
        "route_name": "UMB-CDG Express Corridor",
        "start_station": "Ambala Cantt (UMB)",
        "end_station": "Chandigarh Jn (CDG)",
        "start_latitude": 30.3609,
        "start_longitude": 76.8340,
        "end_latitude": 30.7046,
        "end_longitude": 76.8277,
        "track_length_km": 45.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Shivalik Piedmont Plain",
        "risk_level": "MEDIUM",
        "defect_status": "Minor Thermal Gauge Variation",
        "last_inspection_date": "2026-08-27",
        "speed_limit_kmh": 120,
        "traffic_gmt_per_day": 36,
        "weather": {
            "temperature": 31.0,
            "humidity": 70,
            "rainfall": 18.0,
            "wind_speed": 15.0,
            "weather_condition": "Scattered Showers"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 42,
            "primary_hazard": "Vegetation",
            "hazard_description": "Rapid eucalyptus growth near Derabassi causing reduced sightlines on curves."
        }
    },

    # --- CENTRAL RAILWAY (CR) - Mumbai-Pune (Western Ghats Mountainous) ---
    {
        "section_id": "SEC-CR-201",
        "route_name": "CSTM-PUNE Deccan Expressway",
        "start_station": "Mumbai CSMT (CSMT)",
        "end_station": "Kalyan Jn (KYN)",
        "start_latitude": 18.9400,
        "start_longitude": 72.8353,
        "end_latitude": 19.2437,
        "end_longitude": 73.1355,
        "track_length_km": 53.8,
        "track_type": "Sextuple Broad Gauge (Suburban + Long Distance)",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Coastal Estuary & Alluvium",
        "risk_level": "HIGH",
        "defect_status": "Severe Substructure Water Ingress",
        "last_inspection_date": "2026-08-24",
        "speed_limit_kmh": 105,
        "traffic_gmt_per_day": 85,
        "weather": {
            "temperature": 29.5,
            "humidity": 94,
            "rainfall": 92.0,
            "wind_speed": 42.0,
            "weather_condition": "High Tide & Monsoon Torrent"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 86,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Kurla-Sion creek level matching rail top. Submerged track circuits and point motors active."
        }
    },
    {
        "section_id": "SEC-CR-202",
        "route_name": "CSTM-PUNE Deccan Expressway",
        "start_station": "Kalyan Jn (KYN)",
        "end_station": "Karjat Jn (KJT)",
        "start_latitude": 19.2437,
        "start_longitude": 73.1355,
        "end_latitude": 18.9100,
        "end_longitude": 73.3278,
        "track_length_km": 46.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Ulhas River Valley Plain",
        "risk_level": "MEDIUM",
        "defect_status": "Rail Joint Wear & Bolt Slackness",
        "last_inspection_date": "2026-08-26",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 62,
        "weather": {
            "temperature": 28.0,
            "humidity": 90,
            "rainfall": 48.0,
            "wind_speed": 28.0,
            "weather_condition": "Continuous Rain"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "LOW",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 64,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Water runoff from Matheran foothills collecting at Badlapur yard cut."
        }
    },
    {
        "section_id": "SEC-CR-203",
        "route_name": "Bhor Ghat Mountain Line",
        "start_station": "Karjat Jn (KJT)",
        "end_station": "Lonavala (LNL)",
        "start_latitude": 18.9100,
        "start_longitude": 73.3278,
        "end_latitude": 18.7557,
        "end_longitude": 73.4091,
        "track_length_km": 28.5,
        "track_type": "Triple Mountain Gauge (1 in 37 Gradient)",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Western Ghats Escarpment",
        "risk_level": "CRITICAL",
        "defect_status": "Boulder Fall & Embankment Slip Risk",
        "last_inspection_date": "2026-08-29",
        "speed_limit_kmh": 60,
        "traffic_gmt_per_day": 68,
        "weather": {
            "temperature": 23.0,
            "humidity": 99,
            "rainfall": 140.0,
            "wind_speed": 55.0,
            "weather_condition": "Monsoon Gale & Zero Visibility Fog"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "CRITICAL",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 96,
            "primary_hazard": "Landslide",
            "hazard_description": "Active rockfall zone between Catch Siding #2 and Monkey Hill tunnel. Dynamic soil saturation 98%."
        }
    },
    {
        "section_id": "SEC-CR-204",
        "route_name": "CSTM-PUNE Deccan Expressway",
        "start_station": "Lonavala (LNL)",
        "end_station": "Shivajinagar (SVJR)",
        "start_latitude": 18.7557,
        "start_longitude": 73.4091,
        "end_latitude": 18.5314,
        "end_longitude": 73.8446,
        "track_length_km": 62.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Deccan Plateau",
        "risk_level": "LOW",
        "defect_status": "Operational - Tamp Completed",
        "last_inspection_date": "2026-09-02",
        "speed_limit_kmh": 120,
        "traffic_gmt_per_day": 46,
        "weather": {
            "temperature": 27.5,
            "humidity": 75,
            "rainfall": 12.0,
            "wind_speed": 18.0,
            "weather_condition": "Light Drizzle"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 18,
            "primary_hazard": "None",
            "hazard_description": "Firm basalt plateau subgrade; stable slope drainage."
        }
    },

    # --- WESTERN RAILWAY (WR) - Mumbai-Ahmedabad Coastal Corridor ---
    {
        "section_id": "SEC-WR-301",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Mumbai Central (MMCT)",
        "end_station": "Virar (VR)",
        "start_latitude": 18.9696,
        "start_longitude": 72.8194,
        "end_latitude": 19.4678,
        "end_longitude": 72.8054,
        "track_length_km": 59.0,
        "track_type": "Quadruple Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Coastal Mudflat & Saline",
        "risk_level": "HIGH",
        "defect_status": "Saline Atmospheric Rail Corrosion",
        "last_inspection_date": "2026-08-21",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 78,
        "weather": {
            "temperature": 31.0,
            "humidity": 92,
            "rainfall": 80.0,
            "wind_speed": 35.0,
            "weather_condition": "Coastal Squall"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 76,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Vasai Creek tidal backflow saturating ballast matrix; severe salt spray accelerating fastener corrosion."
        }
    },
    {
        "section_id": "SEC-WR-302",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Virar (VR)",
        "end_station": "Dahanu Road (DRD)",
        "start_latitude": 19.4678,
        "start_longitude": 72.8054,
        "end_latitude": 19.9734,
        "end_longitude": 72.7414,
        "track_length_km": 64.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Coastal Lowland",
        "risk_level": "LOW",
        "defect_status": "Operational - Clear",
        "last_inspection_date": "2026-08-31",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 45,
        "weather": {
            "temperature": 32.0,
            "humidity": 80,
            "rainfall": 15.0,
            "wind_speed": 20.0,
            "weather_condition": "Partly Cloudy"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 28,
            "primary_hazard": "None",
            "hazard_description": "Adequate culvert capacity; recent ballast regulating machine run."
        }
    },
    {
        "section_id": "SEC-WR-303",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Dahanu Road (DRD)",
        "end_station": "Valsad (BL)",
        "start_latitude": 19.9734,
        "start_longitude": 72.7414,
        "end_latitude": 20.6100,
        "end_longitude": 72.9300,
        "track_length_km": 75.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Alluvial Coastal Strip",
        "risk_level": "MEDIUM",
        "defect_status": "Broken Concrete Sleeper at KM 168",
        "last_inspection_date": "2026-08-23",
        "speed_limit_kmh": 120,
        "traffic_gmt_per_day": 52,
        "weather": {
            "temperature": 33.5,
            "humidity": 78,
            "rainfall": 35.0,
            "wind_speed": 22.0,
            "weather_condition": "Intermittent Rain"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "LOW",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 58,
            "primary_hazard": "Flood",
            "hazard_description": "Daman Ganga river high water mark approaching girder soffit level."
        }
    },
    {
        "section_id": "SEC-WR-304",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Valsad (BL)",
        "end_station": "Surat (ST)",
        "start_latitude": 20.6100,
        "start_longitude": 72.9300,
        "end_latitude": 21.2049,
        "end_longitude": 72.8406,
        "track_length_km": 68.5,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Industrial Alluvial Belt",
        "risk_level": "LOW",
        "defect_status": "Operational - Normal",
        "last_inspection_date": "2026-09-01",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 58,
        "weather": {
            "temperature": 34.0,
            "humidity": 72,
            "rainfall": 8.0,
            "wind_speed": 16.0,
            "weather_condition": "Hazy Sunshine"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 24,
            "primary_hazard": "None",
            "hazard_description": "Heavy industrial corridor; high freight traffic but clear track drainage."
        }
    },
    {
        "section_id": "SEC-WR-305",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Surat (ST)",
        "end_station": "Vadodara Jn (BRC)",
        "start_latitude": 21.2049,
        "start_longitude": 72.8406,
        "end_latitude": 22.3107,
        "end_longitude": 73.1812,
        "track_length_km": 129.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Black Cotton Soil Basin",
        "risk_level": "CRITICAL",
        "defect_status": "Trackbed Subsidence & Subgrade Heave",
        "last_inspection_date": "2026-08-16",
        "speed_limit_kmh": 100,
        "traffic_gmt_per_day": 64,
        "weather": {
            "temperature": 36.5,
            "humidity": 85,
            "rainfall": 88.0,
            "wind_speed": 30.0,
            "weather_condition": "Tropical Storm Downpour"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 91,
            "primary_hazard": "Flood",
            "hazard_description": "Narmada River catchment flooding near Bharuch. Highly expansive black cotton soil losing bearing capacity."
        }
    },
    {
        "section_id": "SEC-WR-306",
        "route_name": "BCT-ADI Mainline Trunk",
        "start_station": "Vadodara Jn (BRC)",
        "end_station": "Ahmedabad Jn (ADI)",
        "start_latitude": 22.3107,
        "start_longitude": 73.1812,
        "end_latitude": 23.0225,
        "end_longitude": 72.5714,
        "track_length_km": 99.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Alluvial Gujarat Plains",
        "risk_level": "LOW",
        "defect_status": "Operational - Clear",
        "last_inspection_date": "2026-08-28",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 52,
        "weather": {
            "temperature": 37.0,
            "humidity": 65,
            "rainfall": 5.0,
            "wind_speed": 18.0,
            "weather_condition": "Warm / Sunny"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 20,
            "primary_hazard": "None",
            "hazard_description": "Newly renewed track panels with PSC sleepers and 60kg rails."
        }
    },

    # --- EASTERN RAILWAY (ER) - Howrah-Asansol Grand Chord ---
    {
        "section_id": "SEC-ER-401",
        "route_name": "HWH-NDLS Grand Chord",
        "start_station": "Howrah Jn (HWH)",
        "end_station": "Barddhaman Jn (BWN)",
        "start_latitude": 22.5839,
        "start_longitude": 88.3426,
        "end_latitude": 23.2324,
        "end_longitude": 87.8615,
        "track_length_km": 95.0,
        "track_type": "Triple Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Lower Gangetic Delta Plain",
        "risk_level": "HIGH",
        "defect_status": "Severe Subgrade Water Saturation",
        "last_inspection_date": "2026-08-19",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 74,
        "weather": {
            "temperature": 32.0,
            "humidity": 96,
            "rainfall": 105.0,
            "wind_speed": 45.0,
            "weather_condition": "Monsoon Depression / Heavy Gale"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 89,
            "primary_hazard": "Flood",
            "hazard_description": "Damodar canal breach warning. Silt deposition clogging ballast drains along Dankuni freight corridor."
        }
    },
    {
        "section_id": "SEC-ER-402",
        "route_name": "HWH-NDLS Grand Chord",
        "start_station": "Barddhaman Jn (BWN)",
        "end_station": "Asansol Jn (ASN)",
        "start_latitude": 23.2324,
        "start_longitude": 87.8615,
        "end_latitude": 23.6889,
        "end_longitude": 86.9661,
        "track_length_km": 106.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Chota Nagpur Undulating Plateau",
        "risk_level": "MEDIUM",
        "defect_status": "Heavy Axle Wheel-Burn & Spalling",
        "last_inspection_date": "2026-08-25",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 82,
        "weather": {
            "temperature": 33.5,
            "humidity": 82,
            "rainfall": 32.0,
            "wind_speed": 24.0,
            "weather_condition": "Thunderstorms"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 52,
            "primary_hazard": "Vegetation",
            "hazard_description": "Overhanging bamboo clumps along Raniganj coal belt cutting touching 25kV traction lines."
        }
    },
    {
        "section_id": "SEC-ER-403",
        "route_name": "HWH-NDLS Grand Chord",
        "start_station": "Asansol Jn (ASN)",
        "end_station": "Dhanbad Jn (DHN)",
        "start_latitude": 23.6889,
        "start_longitude": 86.9661,
        "end_latitude": 23.7957,
        "end_longitude": 86.4304,
        "track_length_km": 58.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Mining Coalfield Plateau",
        "risk_level": "CRITICAL",
        "defect_status": "Subterranean Mine Fire Embankment Instability",
        "last_inspection_date": "2026-08-14",
        "speed_limit_kmh": 75,
        "traffic_gmt_per_day": 90,
        "weather": {
            "temperature": 38.0,
            "humidity": 65,
            "rainfall": 20.0,
            "wind_speed": 20.0,
            "weather_condition": "Smoky Haze & Heat"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "CRITICAL",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 92,
            "primary_hazard": "Landslide",
            "hazard_description": "Jharia coalfield underground void subsidence risk. Embankment settlement monitors show 12mm creep."
        }
    },

    # --- SOUTH CENTRAL RAILWAY (SCR) - Secunderabad-Vijayawada ---
    {
        "section_id": "SEC-SCR-501",
        "route_name": "SC-BZA High Density Trunk",
        "start_station": "Secunderabad Jn (SC)",
        "end_station": "Kazipet Jn (KZJ)",
        "start_latitude": 17.4399,
        "start_longitude": 78.5017,
        "end_latitude": 17.9784,
        "end_longitude": 79.5218,
        "track_length_km": 132.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Telangana Granitic Plateau",
        "risk_level": "LOW",
        "defect_status": "Operational - Normal",
        "last_inspection_date": "2026-09-02",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 50,
        "weather": {
            "temperature": 35.0,
            "humidity": 55,
            "rainfall": 0.0,
            "wind_speed": 14.0,
            "weather_condition": "Clear Sky"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 14,
            "primary_hazard": "None",
            "hazard_description": "Solid granitic foundation; zero settlement issues."
        }
    },
    {
        "section_id": "SEC-SCR-502",
        "route_name": "SC-BZA High Density Trunk",
        "start_station": "Kazipet Jn (KZJ)",
        "end_station": "Khammam (KMT)",
        "start_latitude": 17.9784,
        "start_longitude": 79.5218,
        "end_latitude": 17.2473,
        "end_longitude": 80.1514,
        "track_length_km": 118.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Rolling Hills & Plain",
        "risk_level": "MEDIUM",
        "defect_status": "Worn Frog Point at Mahbubabad Crossover",
        "last_inspection_date": "2026-08-26",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 56,
        "weather": {
            "temperature": 34.0,
            "humidity": 70,
            "rainfall": 25.0,
            "wind_speed": 19.0,
            "weather_condition": "Passing Thunderstorms"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 45,
            "primary_hazard": "Vegetation",
            "hazard_description": "Fast growing scrub vegetation along drainage trenches requiring clearing gang deployment."
        }
    },
    {
        "section_id": "SEC-SCR-503",
        "route_name": "SC-BZA High Density Trunk",
        "start_station": "Khammam (KMT)",
        "end_station": "Vijayawada Jn (BZA)",
        "start_latitude": 17.2473,
        "start_longitude": 80.1514,
        "end_latitude": 16.5186,
        "end_longitude": 80.6200,
        "track_length_km": 104.0,
        "track_type": "Triple Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Krishna River Delta",
        "risk_level": "CRITICAL",
        "defect_status": "Krishna Riverbed Scour & Embankment Erosion",
        "last_inspection_date": "2026-08-17",
        "speed_limit_kmh": 90,
        "traffic_gmt_per_day": 76,
        "weather": {
            "temperature": 33.0,
            "humidity": 92,
            "rainfall": 95.0,
            "wind_speed": 40.0,
            "weather_condition": "Bay of Bengal Cyclone Band"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 94,
            "primary_hazard": "Flood",
            "hazard_description": "Krishna Barrage surplus discharge flooding Kondapalli freight bypass; active scour around Pier #12."
        }
    },

    # --- SOUTHERN RAILWAY (SR) - Chennai-Bangalore Corridor ---
    {
        "section_id": "SEC-SR-601",
        "route_name": "MAS-SBC Mainline Trunk",
        "start_station": "Chennai Central (MAS)",
        "end_station": "Arakkonam Jn (AJJ)",
        "start_latitude": 13.0827,
        "start_longitude": 80.2707,
        "end_latitude": 13.0788,
        "end_longitude": 79.6681,
        "track_length_km": 68.0,
        "track_type": "Quadruple Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Coastal Lowland Basin",
        "risk_level": "HIGH",
        "defect_status": "Heavy Ballast Voiding near Cooum Basin",
        "last_inspection_date": "2026-08-20",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 72,
        "weather": {
            "temperature": 35.5,
            "humidity": 88,
            "rainfall": 55.0,
            "wind_speed": 32.0,
            "weather_condition": "Northeast Monsoon Pre-Storm"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "MODERATE",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 79,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Vyasarpadi yard low-elevation bottleneck prone to tidal waterlogging; sump pump automatic alert triggered."
        }
    },
    {
        "section_id": "SEC-SR-602",
        "route_name": "MAS-SBC Mainline Trunk",
        "start_station": "Arakkonam Jn (AJJ)",
        "end_station": "Katpadi Jn (KPD)",
        "start_latitude": 13.0788,
        "start_longitude": 79.6681,
        "end_latitude": 12.9698,
        "end_longitude": 79.1325,
        "track_length_km": 62.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Palar River Basin",
        "risk_level": "LOW",
        "defect_status": "Operational - Normal",
        "last_inspection_date": "2026-09-03",
        "speed_limit_kmh": 130,
        "traffic_gmt_per_day": 46,
        "weather": {
            "temperature": 34.0,
            "humidity": 65,
            "rainfall": 0.0,
            "wind_speed": 15.0,
            "weather_condition": "Partly Cloudy"
        },
        "environmental": {
            "flood_risk": "LOW",
            "landslide_risk": "LOW",
            "waterlogging_risk": "LOW",
            "vegetation_risk": "LOW",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 16,
            "primary_hazard": "None",
            "hazard_description": "Dry sandy soil, well maintained ballast profile."
        }
    },
    {
        "section_id": "SEC-SR-603",
        "route_name": "MAS-SBC Mainline Trunk",
        "start_station": "Katpadi Jn (KPD)",
        "end_station": "Jolarpettai Jn (JTJ)",
        "start_latitude": 12.9698,
        "start_longitude": 79.1325,
        "end_latitude": 12.5714,
        "end_longitude": 78.5833,
        "track_length_km": 84.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Javadi Hills Foot Zone",
        "risk_level": "MEDIUM",
        "defect_status": "Missing Elastic Rail Clips (KM 184)",
        "last_inspection_date": "2026-08-27",
        "speed_limit_kmh": 110,
        "traffic_gmt_per_day": 54,
        "weather": {
            "temperature": 31.0,
            "humidity": 74,
            "rainfall": 22.0,
            "wind_speed": 18.0,
            "weather_condition": "Evening Showers"
        },
        "environmental": {
            "flood_risk": "MODERATE",
            "landslide_risk": "LOW",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "LOW",
            "environmental_risk_score": 48,
            "primary_hazard": "Vegetation",
            "hazard_description": "Dense slope foliage near Ambur affecting signal sighting distances."
        }
    },

    # --- KONKAN RAILWAY (KRCL) - High Landslide & Monsoon Geohazards ---
    {
        "section_id": "SEC-KR-701",
        "route_name": "Konkan Coastal Spine",
        "start_station": "Roha (ROHA)",
        "end_station": "Khed (KHED)",
        "start_latitude": 18.4357,
        "start_longitude": 73.1189,
        "end_latitude": 17.7167,
        "end_longitude": 73.3833,
        "track_length_km": 112.0,
        "track_type": "Single Broad Gauge (Heavy Axle)",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Rugged Sahyadri Ghat Cuttings",
        "risk_level": "CRITICAL",
        "defect_status": "Deep Cutting Boulder Infiltration",
        "last_inspection_date": "2026-08-28",
        "speed_limit_kmh": 75,
        "traffic_gmt_per_day": 38,
        "weather": {
            "temperature": 26.0,
            "humidity": 98,
            "rainfall": 165.0,
            "wind_speed": 50.0,
            "weather_condition": "Torrential Monsoon Downpour"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "CRITICAL",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 98,
            "primary_hazard": "Landslide",
            "hazard_description": "Dasgaon deep cutting rockfall alert; inclinometers detected 22mm slope displacement; anti-rockfall netting breached."
        }
    },
    {
        "section_id": "SEC-KR-702",
        "route_name": "Konkan Coastal Spine",
        "start_station": "Khed (KHED)",
        "end_station": "Ratnagiri (RN)",
        "start_latitude": 17.7167,
        "start_longitude": 73.3833,
        "end_latitude": 16.9833,
        "end_longitude": 73.3333,
        "track_length_km": 94.0,
        "track_type": "Single Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Lateritic Plateau & Ravines",
        "risk_level": "HIGH",
        "defect_status": "Viaduct Bearing Displacement",
        "last_inspection_date": "2026-08-22",
        "speed_limit_kmh": 90,
        "traffic_gmt_per_day": 34,
        "weather": {
            "temperature": 27.5,
            "humidity": 95,
            "rainfall": 110.0,
            "wind_speed": 46.0,
            "weather_condition": "Monsoon Squalls"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "HIGH",
            "waterlogging_risk": "MODERATE",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 78,
            "primary_hazard": "Landslide",
            "hazard_description": "Panval Nadi Viaduct approach cutting soil erosion; ballast wash monitoring active."
        }
    },
    {
        "section_id": "SEC-KR-703",
        "route_name": "Konkan Coastal Spine",
        "start_station": "Ratnagiri (RN)",
        "end_station": "Madgaon Jn (MAO)",
        "start_latitude": 16.9833,
        "start_longitude": 73.3333,
        "end_latitude": 15.2736,
        "end_longitude": 73.9581,
        "track_length_km": 236.0,
        "track_type": "Single Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Coastal Ghats / Zuari Estuary",
        "risk_level": "MEDIUM",
        "defect_status": "Tunnel Water Leakage & Silt Buildup",
        "last_inspection_date": "2026-08-25",
        "speed_limit_kmh": 100,
        "traffic_gmt_per_day": 32,
        "weather": {
            "temperature": 28.5,
            "humidity": 92,
            "rainfall": 60.0,
            "wind_speed": 30.0,
            "weather_condition": "Tropical Thunderstorms"
        },
        "environmental": {
            "flood_risk": "HIGH",
            "landslide_risk": "HIGH",
            "waterlogging_risk": "HIGH",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "MODERATE",
            "environmental_risk_score": 66,
            "primary_hazard": "Waterlogging",
            "hazard_description": "Karbude tunnel seepage overflowing catch-water drains into ballast shoulder."
        }
    },

    # --- NORTHEAST FRONTIER RAILWAY (NFR) - High Rain & Flood ---
    {
        "section_id": "SEC-NFR-801",
        "route_name": "Chicken's Neck Corridor",
        "start_station": "New Jalpaiguri (NJP)",
        "end_station": "New Cooch Behar (NCB)",
        "start_latitude": 26.6853,
        "start_longitude": 88.4419,
        "end_latitude": 26.3456,
        "end_longitude": 89.4719,
        "track_length_km": 124.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Duars Sub-Himalayan Floodplain",
        "risk_level": "HIGH",
        "defect_status": "Teesta River High Water Scour Warning",
        "last_inspection_date": "2026-08-20",
        "speed_limit_kmh": 100,
        "traffic_gmt_per_day": 44,
        "weather": {
            "temperature": 28.0,
            "humidity": 96,
            "rainfall": 128.0,
            "wind_speed": 34.0,
            "weather_condition": "Monsoon Inundation"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "HIGH",
            "environmental_risk_score": 87,
            "primary_hazard": "Flood",
            "hazard_description": "Teesta River gauge above danger mark. Spur bund near KM 48 under high hydrodynamic pressure."
        }
    },
    {
        "section_id": "SEC-NFR-802",
        "route_name": "Brahmaputra Valley Trunk",
        "start_station": "New Cooch Behar (NCB)",
        "end_station": "Guwahati (GHY)",
        "start_latitude": 26.3456,
        "start_longitude": 89.4719,
        "end_latitude": 26.1822,
        "end_longitude": 91.7506,
        "track_length_km": 178.0,
        "track_type": "Double Broad Gauge",
        "electrified": "25kV AC 50Hz OHE",
        "terrain": "Brahmaputra Low Alluvium",
        "risk_level": "CRITICAL",
        "defect_status": "Embankment Slump & Ballast Washout",
        "last_inspection_date": "2026-08-16",
        "speed_limit_kmh": 80,
        "traffic_gmt_per_day": 42,
        "weather": {
            "temperature": 29.0,
            "humidity": 97,
            "rainfall": 150.0,
            "wind_speed": 40.0,
            "weather_condition": "Heavy Flood Rains"
        },
        "environmental": {
            "flood_risk": "CRITICAL",
            "landslide_risk": "LOW",
            "waterlogging_risk": "CRITICAL",
            "vegetation_risk": "HIGH",
            "extreme_weather_risk": "CRITICAL",
            "environmental_risk_score": 95,
            "primary_hazard": "Flood",
            "hazard_description": "Brahmaputra tributary overflow breaching track embankment at KM 118; emergency boulders dumping in progress."
        }
    }
]


def generate_all_data():
    """Generates railway sections, weather, and environmental risk datasets."""
    print("================================================================")
    print("  RAILGUARD MEMBER 6: SYNTHETIC DATA GENERATOR                  ")
    print("================================================================")

    railway_sections = []
    weather_data = {}
    environmental_risk = {}

    for sec in SECTIONS:
        # Calculate midpoint
        mid_lat = round((sec["start_latitude"] + sec["end_latitude"]) / 2.0, 4)
        mid_lon = round((sec["start_longitude"] + sec["end_longitude"]) / 2.0, 4)

        # 1. Railway Section Record
        section_record = {
            "section_id": sec["section_id"],
            "route_name": sec["route_name"],
            "start_station": sec["start_station"],
            "end_station": sec["end_station"],
            "latitude": mid_lat,
            "longitude": mid_lon,
            "start_latitude": sec["start_latitude"],
            "start_longitude": sec["start_longitude"],
            "end_latitude": sec["end_latitude"],
            "end_longitude": sec["end_longitude"],
            "track_length_km": sec["track_length_km"],
            "track_type": sec["track_type"],
            "electrified": sec["electrified"],
            "terrain": sec["terrain"],
            "risk_level": sec["risk_level"],
            "defect_status": sec["defect_status"],
            "last_inspection_date": sec["last_inspection_date"],
            "speed_limit_kmh": sec.get("speed_limit_kmh", 110),
            "traffic_gmt_per_day": sec.get("traffic_gmt_per_day", 50),
            # Route polyline waypoints for realistic rendering on Leaflet
            "coordinates": [
                [sec["start_latitude"], sec["start_longitude"]],
                [mid_lat, mid_lon],
                [sec["end_latitude"], sec["end_longitude"]]
            ]
        }
        railway_sections.append(section_record)

        # 2. Weather Record
        w = sec["weather"]
        weather_data[sec["section_id"]] = {
            "section_id": sec["section_id"],
            "route_name": sec["route_name"],
            "latitude": mid_lat,
            "longitude": mid_lon,
            "temperature": w["temperature"],
            "humidity": w["humidity"],
            "rainfall": w["rainfall"],
            "wind_speed": w["wind_speed"],
            "weather_condition": w["weather_condition"],
            "source": "Synthetic IMD High-Resolution Grid",
            "last_updated": "2026-09-05T12:00:00Z"
        }

        # 3. Environmental Risk Record
        e = sec["environmental"]
        environmental_risk[sec["section_id"]] = {
            "section_id": sec["section_id"],
            "route_name": sec["route_name"],
            "latitude": mid_lat,
            "longitude": mid_lon,
            "flood_risk": e["flood_risk"],
            "landslide_risk": e["landslide_risk"],
            "waterlogging_risk": e["waterlogging_risk"],
            "vegetation_risk": e["vegetation_risk"],
            "extreme_weather_risk": e["extreme_weather_risk"],
            "environmental_risk_score": e["environmental_risk_score"],
            "primary_hazard": e["primary_hazard"],
            "hazard_description": e["hazard_description"],
            "sensor_station": f"ENV-SENSOR-{sec['section_id']}"
        }

    # Write files to data/ and frontend/src/data/
    targets = [DATA_DIR, FRONTEND_DATA_DIR]

    for target in targets:
        # JSON: railway_sections.json
        with open(target / "railway_sections.json", "w", encoding="utf-8") as f:
            json.dump(railway_sections, f, indent=2)

        # JSON: weather_data.json
        with open(target / "weather_data.json", "w", encoding="utf-8") as f:
            json.dump(weather_data, f, indent=2)

        # JSON: environmental_risk.json
        with open(target / "environmental_risk.json", "w", encoding="utf-8") as f:
            json.dump(environmental_risk, f, indent=2)

    # CSV: railway_sections.csv (in data/)
    csv_file = DATA_DIR / "railway_sections.csv"
    fieldnames = [
        "section_id", "route_name", "start_station", "end_station",
        "latitude", "longitude", "start_latitude", "start_longitude",
        "end_latitude", "end_longitude", "track_length_km", "track_type",
        "electrified", "terrain", "risk_level", "defect_status",
        "last_inspection_date", "speed_limit_kmh", "traffic_gmt_per_day"
    ]
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for s in railway_sections:
            row = {k: s[k] for k in fieldnames}
            writer.writerow(row)

    print(f"Generated {len(railway_sections)} Railway Sections successfully!")
    print(f"Saved JSON & CSV files to:\n  - {DATA_DIR}\n  - {FRONTEND_DATA_DIR}")
    print("================================================================")


if __name__ == "__main__":
    generate_all_data()
