import { useState, useEffect } from 'react'
import './App.css'

interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('London');

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000//api/weather/${location}`);
        const data = await response.json();
        setWeatherData(data);
        // Cache the data in localStorage with timestamp
        localStorage.setItem('weatherData', JSON.stringify({
          data,
          timestamp: Date.now(),
          location
        }));
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check cache before fetching
    const cachedData = localStorage.getItem('weatherData');
    if (cachedData) {
      const { data, timestamp, location: cachedLocation } = JSON.parse(cachedData);
      const isCacheValid = Date.now() - timestamp < 1800000; // 30 minutes cache
      
      if (isCacheValid && location === cachedLocation) {
        setWeatherData(data);
        setLoading(false);
        return;
      }
    }

    fetchWeatherData();
  }, [location]);

  return (
    <div className="weather-app">
      <header>
        <h1>Weather Forecast</h1>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location..."
        />
      </header>

      {loading ? (
        <div className="loading">Loading weather data...</div>
      ) : weatherData ? (
        <div className="weather-content">
          <div className="current-weather">
            <h2>{weatherData.location}</h2>
            <div className="current-details">
              <p className="temperature">{weatherData.current.temp}°C</p>
              <p className="condition">{weatherData.current.condition}</p>
              <div className="extra-info">
                <p>Humidity: {weatherData.current.humidity}%</p>
                <p>Wind: {weatherData.current.windSpeed} km/h</p>
              </div>
            </div>
          </div>

          <div className="forecast">
            <h3>7-Day Forecast</h3>
            <div className="forecast-grid">
              {weatherData.forecast.map((day) => (
                <div key={day.date} className="forecast-day">
                  <p className="date">{day.date}</p>
                  <p className="temp">{day.temp}°C</p>
                  <p className="condition">{day.condition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="error">Unable to load weather data</div>
      )}
    </div>
  );
}

export default App