from flask import Flask, request, jsonify
from cachelib.simple import SimpleCache
import requests

app = Flask(__name__)
cache = SimpleCache()

# Replace with your actual weather API key and endpoint
WEATHER_API_KEY = '48c73a4b186275a01edeff6870083242'

WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/'

CACHE_TIMEOUT = 1800  # 30 minutes

def fetch_weather(endpoint, params):
    params['appid'] = WEATHER_API_KEY
    cache_key = f"{endpoint}:{str(params)}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    resp = requests.get(f"{WEATHER_API_URL}{endpoint}", params=params)
    if resp.status_code == 200:
        data = resp.json()
        cache.set(cache_key, data, timeout=CACHE_TIMEOUT)
        return data
    return None

@app.route('/api/weather/current')
def current_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400
    data = fetch_weather('weather', {'q': city, 'units': 'metric'})
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch weather data'}), 500

@app.route('/api/weather/forecast')
def forecast_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400
    data = fetch_weather('forecast', {'q': city, 'units': 'metric'})
    if data:
        return jsonify(data)
    return jsonify({"No Data Found"}), 500

if __name__ == '__main__':
    app.run(debug=True)
