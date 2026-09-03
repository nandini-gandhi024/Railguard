from typing import Dict, Any

def get_weather_context(location: str = "Delhi Division") -> Dict[str, Any]:
    """
    Interface for Member 6's Weather & Environmental Service.
    Retrieves weather, satellite terrain, and environmental stress indicators.
    
    Synthetic data is clearly labeled as synthetic.
    """
    return {
        "location": location,
        "temperature_c": 38.0,
        "humidity_pct": 65.0,
        "monsoon_alert": False,
        "rail_surface_temp_c": 52.0,
        "environmental_risk": "Moderate Thermal Expansion Stress",
        "geospatial_context": {
            "terrain_type": "Gangetic Alluvial Plain",
            "soil_stability": "Stable (Synthetic)",
            "flood_history": "Low Risk (Synthetic)",
            "satellite_data_source": "Public Geospatial Surface Model (Synthetic)"
        }
    }
