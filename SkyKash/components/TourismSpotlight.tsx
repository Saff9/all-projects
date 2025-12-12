// components/TourismSpotlight.tsx
'use client';

import { useState, useEffect } from 'react';

const KASHMIR_SPOTS = [
  {
    id: 1,
    name: "Dal Lake",
    description: "Famous for shikara rides and houseboats",
    bestTime: "March to October",
    image: "🏞️",
    weather: "Pleasant for boat rides",
    tags: ["Boating", "Photography", "Relaxing"]
  },
  {
    id: 2,
    name: "Gulmarg",
    description: "Skiing paradise with gondola rides",
    bestTime: "December to February",
    image: "⛷️",
    weather: "Perfect for snow activities",
    tags: ["Skiing", "Adventure", "Snow"]
  },
  {
    id: 3,
    name: "Pahalgam",
    description: "Valley of shepherds with scenic beauty",
    bestTime: "April to October",
    image: "🏕️",
    weather: "Great for trekking",
    tags: ["Trekking", "Nature", "River"]
  },
  {
    id: 4,
    name: "Sonamarg",
    description: "Meadow of gold with glaciers",
    bestTime: "May to September",
    image: "❄️",
    weather: "Ideal for glacier visits",
    tags: ["Glacier", "Meadow", "Adventure"]
  }
];

export default function TourismSpotlight() {
  const [currentSpot, setCurrentSpot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpot((prev) => (prev + 1) % KASHMIR_SPOTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const spot = KASHMIR_SPOTS[currentSpot];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200">
          🏔️ Kashmir Spotlight
        </h3>
        <div className="flex space-x-1">
          {KASHMIR_SPOTS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSpot(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSpot 
                  ? 'bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500 w-4' 
                  : 'bg-kashmir-light-neutral-300 dark:bg-kashmir-dark-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{spot.image}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
            {spot.name}
          </h4>
          <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 mt-1">
            {spot.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {spot.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-kashmir-light-green-100 dark:bg-kashmir-dark-green-900 text-kashmir-light-green-700 dark:text-kashmir-dark-green-300 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
            <span>🕐 Best time: {spot.bestTime}</span>
            <span className="ml-3">🌤️ {spot.weather}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
