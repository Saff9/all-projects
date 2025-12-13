// components/WorldWeather.tsx
'use client';

import { useState, useEffect } from 'react';

const WORLD_CITIES = [
  { name: "Srinagar", country: "India", emoji: "🏔️" },
  { name: "Dubai", country: "UAE", emoji: "🏙️" },
  { name: "London", country: "UK", emoji: "🌁" },
  { name: "New York", country: "USA", emoji: "🗽" },
  { name: "Tokyo", country: "Japan", emoji: "🗼" },
  { name: "Sydney", country: "Australia", emoji: "🐨" }
];

export default function WorldWeather() {
  const [worldWeather, setWorldWeather] = useState<{[key: string]: any}>({});

  useEffect(() => {
    // Mock world weather data
    const mockWeather = WORLD_CITIES.reduce((acc, city) => {
      acc[city.name] = {
        temp: Math.floor(Math.random() * 40) - 5,
        condition: ["Sunny", "Cloudy", "Rainy", "Snowy"][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 50) + 30
      };
      return acc;
    }, {} as any);

    setWorldWeather(mockWeather);
  }, []);

  const getTempColor = (temp: number) => {
    if (temp < 0) return 'text-blue-500';
    if (temp < 10) return 'text-cyan-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
        🌍 World Weather
      </h3>
      
      <div className="space-y-3">
        {WORLD_CITIES.map((city) => {
          const weather = worldWeather[city.name];
          if (!weather) return null;

          return (
            <div key={city.name} className="flex items-center justify-between p-3 bg-kashmir-light-neutral-50 dark:bg-kashmir-dark-neutral-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{city.emoji}</span>
                <div>
                  <p className="font-semibold text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
                    {city.name}
                  </p>
                  <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
                    {city.country}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${getTempColor(weather.temp)}`}>
                  {weather.temp}°C
                </p>
                <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500 capitalize">
                  {weather.condition}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
          Compare weather across major cities
        </p>
      </div>
    </div>
  );
}
