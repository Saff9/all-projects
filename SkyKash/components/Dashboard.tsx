// components/Dashboard.tsx - Key updates for mobile and time format
'use client';

import { useState, useEffect } from 'react';
import Menu from './Menu';
import WeatherCard from './WeatherCard';
import InstallPrompt from './InstallPrompt';
import { useLocation } from '../hooks/useLocation';
import { useDynamicTheme } from '../hooks/useDynamicTheme';

// Import the 7 new features
import TourismSpotlight from './TourismSpotlight';
import AirQuality from './AirQuality';
import PrayerTimes from './PrayerTimes';
import WeatherTrends from './WeatherTrends';
import ActivityRecommendations from './ActivityRecommendations';
import WorldWeather from './WorldWeather';
import ThemeIndicator from './ThemeIndicator';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  uv?: {
    value: number;
    risk: string;
    protection: string;
  };
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [activeFeature, setActiveFeature] = useState('weather');
  const [currentTime, setCurrentTime] = useState('');
  
  const { location, loading: locationLoading, error: locationError } = useLocation();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const autoLocation = localStorage.getItem('autoLocation') !== 'false';
    
    if (name) {
      setUserName(name);
    }

    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    if (autoLocation && location && !weatherData) {
      fetchWeatherByCoords(location.latitude, location.longitude);
      setUsingCurrentLocation(true);
    } else if (!weatherData) {
      fetchWeatherData('Srinagar');
    }

    return () => clearInterval(timeInterval);
  }, [location]);

  // Apply dynamic theme
  useDynamicTheme(
    weatherData?.weather[0]?.description || '', 
    weatherData?.main?.temp || 0
  );

  const fetchWeatherData = async (city: string) => {
    try {
      setIsLoading(true);
      setError('');
      setActiveFeature('weather');
      
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setUsingCurrentLocation(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Unable to load weather data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      setError('');
      setActiveFeature('location');
      
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
      setUsingCurrentLocation(true);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Unable to load weather data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherData(searchCity.trim());
      setSearchCity('');
      setActiveFeature('search');
    }
  };

  const handleUseCurrentLocation = () => {
    if (location) {
      fetchWeatherByCoords(location.latitude, location.longitude);
      setActiveFeature('location');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  return (
    <div className="min-h-screen bg-kashmir-light-neutral-50 dark:bg-kashmir-dark-neutral-50 transition-colors duration-300 mobile-container">
      {/* Header - Improved for Mobile */}
      <header className="bg-white/90 dark:bg-kashmir-dark-neutral-100/90 backdrop-blur-sm border-b border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300 transition-colors duration-300 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200 transition-colors text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">❄️ SkyKash</h1>
                <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
                  {currentTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-kashmir-light-green-600 dark:text-kashmir-dark-green-400 font-semibold text-sm">
                {getGreeting()}, {userName}!
              </p>
              <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
                {usingCurrentLocation && location ? `📍 ${location.city}` : 'Kashmir Weather'}
              </p>
            </div>
          </div>

          {/* Search Bar - Improved for Mobile */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search city..."
              className="flex-1 px-3 py-2 border border-kashmir-light-neutral-300 dark:border-kashmir-dark-neutral-400 rounded-lg focus:ring-2 focus:ring-kashmir-light-blue-500 dark:focus:ring-kashmir-dark-blue-500 focus:border-transparent bg-white/50 dark:bg-kashmir-dark-neutral-100/50 text-kashmir-light-neutral-900 dark:text-kashmir-dark-neutral-100 transition-colors duration-300 text-sm"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-kashmir-light-blue-500 hover:bg-kashmir-light-blue-600 dark:bg-kashmir-dark-blue-500 dark:hover:bg-kashmir-dark-blue-600 text-white rounded-lg transition-colors duration-300 text-sm min-w-[60px]"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading || !location}
              className="px-3 py-2 bg-kashmir-light-green-500 hover:bg-kashmir-light-green-600 dark:bg-kashmir-dark-green-500 dark:hover:bg-kashmir-dark-green-600 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm min-w-[70px]"
            >
              📍 Current
            </button>
          </form>
        </div>
      </header>

      {/* Main Content - Improved for Mobile */}
      <main className="container mx-auto px-4 py-6 mobile-padding">
        {/* Status Indicators */}
        {(usingCurrentLocation && location) || locationError ? (
          <div className="grid grid-cols-1 gap-3 mb-4">
            {usingCurrentLocation && location && (
              <div className="p-3 bg-kashmir-light-green-50 dark:bg-kashmir-dark-green-900 border border-kashmir-light-green-200 dark:border-kashmir-dark-green-300 rounded-lg">
                <p className="text-kashmir-light-green-700 dark:text-kashmir-dark-green-400 text-sm">
                  🌍 Auto-detected: <strong>{location.city}</strong>
                </p>
              </div>
            )}
            
            {locationError && (
              <div className="p-3 bg-kashmir-light-neutral-100 dark:bg-kashmir-dark-neutral-200 border border-kashmir-light-neutral-300 dark:border-kashmir-dark-neutral-400 rounded-lg">
                <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300 text-sm">
                  ℹ️ Using default location: Srinagar
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Error State */}
        {error ? (
          <div className="card p-6 text-center">
            <div className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 mb-4">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300 mb-4 text-sm">{error}</p>
            <button 
              onClick={() => fetchWeatherData('Srinagar')}
              className="btn-primary text-sm py-2 px-4"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="card p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kashmir-light-blue-500 dark:border-kashmir-dark-blue-500 mx-auto"></div>
            <p className="mt-4 text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 text-sm">
              {locationLoading ? 'Detecting location...' : 'Loading weather...'}
            </p>
          </div>
        ) : weatherData ? (
          <>
            {/* Main Weather Card */}
            <WeatherCard weatherData={weatherData} timeOfDay={getTimeOfDay()} />

            {/* Theme Indicator */}
            <div className="mt-4">
              <ThemeIndicator 
                weatherCondition={weatherData.weather[0]?.description || ''}
                temperature={weatherData.main.temp}
              />
            </div>

            {/* 7 New Features Grid - Improved for Mobile */}
            <div className="feature-grid mt-6">
              <TourismSpotlight />
              <AirQuality city={weatherData.name} />
              <PrayerTimes />
              <WeatherTrends currentTemp={weatherData.main.temp} />
              <ActivityRecommendations 
                weather={weatherData.weather[0]?.description || ''}
                temperature={weatherData.main.temp}
                timeOfDay={getTimeOfDay()}
              />
              <WorldWeather />
            </div>

            {/* Quick Stats - Improved for Mobile */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="card p-3 text-center">
                <div className="text-xl mb-1">🌡️</div>
                <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">Feels Like</p>
                <p className="text-sm font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
                  {Math.round(weatherData.main.feels_like)}°C
                </p>
              </div>
              
              <div className="card p-3 text-center">
                <div className="text-xl mb-1">💨</div>
                <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">Wind</p>
                <p className="text-sm font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
                  {weatherData.wind.speed} m/s
                </p>
              </div>
              
              <div className="card p-3 text-center">
                <div className="text-xl mb-1">💧</div>
                <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">Humidity</p>
                <p className="text-sm font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
                  {weatherData.main.humidity}%
                </p>
              </div>
              
              <div className="card p-3 text-center">
                <div className="text-xl mb-1">🔍</div>
                <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">Features</p>
                <p className="text-sm font-bold text-kashmir-light-green-600 dark:text-kashmir-dark-green-400">
                  7 Active
                </p>
              </div>
            </div>
          </>
        ) : null}

        {/* Contact Section - Updated with Modern Icons */}
        <div className="card p-4 mt-6 text-center">
          <h3 className="text-base font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-3">
            📱 Connect With Developer
          </h3>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://www.instagram.com/saff9?igsh=MWV6d21lbjVpNXh6Yg==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-1 text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 hover:text-kashmir-light-blue-500 dark:hover:text-kashmir-dark-blue-400 transition-colors p-2 rounded-lg hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200"
            >
              <img src="/instagram-icon.png" alt="Instagram" className="w-6 h-6" />
              <span className="text-xs font-medium">Instagram</span>
            </a>
            <a 
              href="http://www.youtube.com/@saff9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-1 text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 hover:text-kashmir-light-blue-500 dark:hover:text-kashmir-dark-blue-400 transition-colors p-2 rounded-lg hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200"
            >
              <img src="/youtube-icon.png" alt="YouTube" className="w-6 h-6" />
              <span className="text-xs font-medium">YouTube</span>
            </a>
            <a 
              href="https://github.com/Saff9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-1 text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 hover:text-kashmir-light-blue-500 dark:hover:text-kashmir-dark-blue-400 transition-colors p-2 rounded-lg hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200"
            >
              <img src="/github-icon.png" alt="GitHub" className="w-6 h-6" />
              <span className="text-xs font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </main>

      {/* Menu */}
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
