from flask import Flask, request, jsonify
from flask_cors import CORS
from cachelib.simple import SimpleCache
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
cache = SimpleCache()

WEATHER_API_KEY = '48c73a4b186275a01edeff6870083242'
WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/'
CACHE_TIMEOUT = 1800  # 30 minutes

def format_weather_data(current_data, forecast_data=None):
    """Format weather data into a consistent structure"""
    result = {
        "location": current_data["name"],
        "current": {
            "temp": current_data["main"]["temp"],
            "condition": current_data["weather"][0]["description"],
            "humidity": current_data["main"]["humidity"],
            "windSpeed": current_data["wind"]["speed"]
        }
    }
    
    if forecast_data:
        # Group forecast data by day
        daily_forecasts = {}
        for item in forecast_data["list"]:
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    "temps": [],
                    "conditions": []
                }
            daily_forecasts[date]["temps"].append(item["main"]["temp"])
            daily_forecasts[date]["conditions"].append(item["weather"][0]["description"])

        # Calculate daily averages
        result["forecast"] = [
            {
                "date": date,
                "temp": sum(data["temps"]) / len(data["temps"]),
                "condition": max(set(data["conditions"]), key=data["conditions"].count)
            }
            for date, data in daily_forecasts.items()
        ][:7]  # Limit to 7 days

    return result

def fetch_weather(endpoint, params):
    """Fetch weather data with caching"""
    params['appid'] = WEATHER_API_KEY
    params['units'] = 'metric'  # Always use metric units
    cache_key = f"{endpoint}:{str(params)}"
    
    cached = cache.get(cache_key)
    if cached:
        return cached

    try:
        resp = requests.get(f"{WEATHER_API_URL}{endpoint}", params=params)
        resp.raise_for_status()  # Raise an exception for bad status codes
        data = resp.json()
        cache.set(cache_key, data, timeout=CACHE_TIMEOUT)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {str(e)}")
        return None

@app.route('/api/weather/<location>')
def get_weather(location):
    """Combined endpoint for current weather and forecast"""
    try:
        # Fetch current weather
        current_data = fetch_weather('weather', {'q': location})
        if not current_data:
            return jsonify({'error': 'Failed to fetch current weather'}), 500

        # Fetch forecast
        forecast_data = fetch_weather('forecast', {'q': location})
        if not forecast_data:
            return jsonify({'error': 'Failed to fetch forecast'}), 500

        # Format and combine the data
        formatted_data = format_weather_data(current_data, forecast_data)
        return jsonify(formatted_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)