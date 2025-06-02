import React, { useState } from 'react';
import './App.css';

interface WeatherData {
  name: string;
  sys?: { country?: string };
  weather?: { description?: string }[];
  main?: { temp?: number; humidity?: number };
  wind?: { speed?: number };
}

interface ForecastItem {
  dt: number;
  weather?: { main?: string }[];
  main?: { temp?: number };
}

interface ForecastData {
  list?: ForecastItem[];
}

const API_BASE = '/api/weather';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);
    try {
      const res = await fetch(`${API_BASE}/current?city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('Failed to fetch current weather');
      const data: WeatherData = await res.json();
      setWeather(data);
      const resForecast = await fetch(`${API_BASE}/forecast?city=${encodeURIComponent(city)}`);
      if (!resForecast.ok) throw new Error('Failed to fetch forecast');
      const dataForecast: ForecastData = await resForecast.json();
      setForecast(dataForecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Weather Forecast</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <button onClick={fetchWeather} disabled={loading || !city}>
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {weather && (
        <div className="weather-info">
          <h2>{weather.name}{weather.sys?.country ? `, ${weather.sys.country}` : ''}</h2>
          <p>{weather.weather?.[0]?.description}</p>
          <p>Temperature: {weather.main?.temp}°C</p>
          <p>Humidity: {weather.main?.humidity}%</p>
          <p>Wind: {weather.wind?.speed} m/s</p>
        </div>
      )}
      {forecast && forecast.list && (
        <div className="forecast">
          <h3>Weekly Forecast</h3>
          <div className="forecast-list">
            {forecast.list.slice(0, 7).map((item: ForecastItem, idx: number) => (
              <div key={idx} className="forecast-item">
                <div>{new Date(item.dt * 1000).toLocaleDateString()}</div>
                <div>{item.weather?.[0]?.main}</div>
                <div>{item.main?.temp}°C</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
