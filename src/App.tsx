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
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('London');
  const [searchInput, setSearchInput] = useState('London');
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (loc: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://zwdzcznstnjgkesxdocjxh3pbm0mhmxt.lambda-url.us-east-2.on.aws/api/weather/${loc}`,
        {method:'POST',headers:{'Content-Type':'application/json'}});
      
      if (!response.ok) {
        throw new Error('Location not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
      localStorage.setItem('weatherData', JSON.stringify({
        data,
        timestamp: Date.now(),
        location: loc
      }));
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
      fetchWeatherData(searchInput.trim());
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format temperature to remove decimals
  const formatTemp = (temp: number) => {
    return Math.round(temp);
  };

  // Get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return '☀️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('rain') || cond.includes('drizzle')) return '🌧️';
    if (cond.includes('storm')) return '⛈️';
    if (cond.includes('snow')) return '❄️';
    if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
    return '🌈';
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('weatherData');
    if (cachedData) {
      const { data, timestamp, location: cachedLocation } = JSON.parse(cachedData);
      const isCacheValid = Date.now() - timestamp < 1800000;
      
      if (isCacheValid && location === cachedLocation) {
        setWeatherData(data);
        return;
      }
    }

    fetchWeatherData(location);
  }, [location]);

  return (
    <div className="weather-app">
      <header className="app-header">
        <h1>Weather Forecast</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter location..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </header>

      <div className="weather-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {weatherData && (
          <>
            <div className="current-weather-card">
              <div className="location-header">
                <h2>{weatherData.location}</h2>
                <div className="weather-condition">
                  {getWeatherIcon(weatherData.current.condition)}
                  {weatherData.current.condition}
                </div>
              </div>
              
              <div className="current-weather-main">
                <div className="temperature-display">
                  <span className="temperature">{formatTemp(weatherData.current.temp)}°C</span>
                </div>
                
                <div className="weather-details">
                  <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind Speed</span>
                    <span className="detail-value">{weatherData.current.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="forecast-section">
              <h3>7-Day Forecast</h3>
              <div className="forecast-grid">
                {weatherData.forecast.map((day, index) => (
                  <div key={`${day.date}-${index}`} className="forecast-card">
                    <div className="forecast-date">{formatDate(day.date)}</div>
                    <div className="weather-icon">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="forecast-temp">{formatTemp(day.temp)}°C</div>
                    <div className="forecast-condition">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App