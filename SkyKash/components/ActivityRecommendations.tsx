// components/ActivityRecommendations.tsx
'use client';

interface ActivityRecommendationsProps {
  weather: string;
  temperature: number;
  timeOfDay: string;
}

export default function ActivityRecommendations({ 
  weather, 
  temperature, 
  timeOfDay 
}: ActivityRecommendationsProps) {
  const activities = [
    {
      type: "Outdoor",
      name: "Shikara Ride",
      location: "Dal Lake",
      duration: "2-3 hours",
      bestFor: "Family & Photography",
      conditions: ["Clear", "Sunny", "Partly Cloudy"],
      tempRange: [15, 30]
    },
    {
      type: "Adventure",
      name: "Gondola Ride",
      location: "Gulmarg",
      duration: "4-5 hours",
      bestFor: "Adventure & Views",
      conditions: ["Clear", "Snow"],
      tempRange: [-5, 15]
    },
    {
      type: "Cultural",
      name: "Mughal Gardens",
      location: "Srinagar",
      duration: "2 hours",
      bestFor: "History & Relaxation",
      conditions: ["Clear", "Partly Cloudy"],
      tempRange: [10, 25]
    },
    {
      type: "Spiritual",
      name: "Hazratbal Shrine",
      location: "Dal Lake",
      duration: "1 hour",
      bestFor: "Peace & Spirituality",
      conditions: ["Clear", "Cloudy", "Rain"],
      tempRange: [5, 35]
    }
  ];

  const getRecommendedActivities = () => {
    return activities.filter(activity => 
      activity.conditions.some(condition => 
        weather.toLowerCase().includes(condition.toLowerCase())
      ) && 
      temperature >= activity.tempRange[0] && 
      temperature <= activity.tempRange[1]
    );
  };

  const recommended = getRecommendedActivities();

  if (recommended.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
          🎯 Recommended Activities
        </h3>
        <p className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 text-center py-4">
          No specific recommendations for current weather. Perfect day to relax!
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
        🎯 Perfect For Right Now
      </h3>
      
      <div className="space-y-4">
        {recommended.slice(0, 2).map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-kashmir-light-blue-50 dark:bg-kashmir-dark-blue-900 rounded-lg">
            <div className="text-2xl">
              {activity.type === "Outdoor" && "🚣"}
              {activity.type === "Adventure" && "🚡"}
              {activity.type === "Cultural" && "🏛️"}
              {activity.type === "Spiritual" && "🕌"}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-kashmir-light-blue-700 dark:text-kashmir-dark-blue-300">
                {activity.name}
              </h4>
              <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
                📍 {activity.location}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-2 py-1 bg-kashmir-light-green-100 dark:bg-kashmir-dark-green-900 text-kashmir-light-green-700 dark:text-kashmir-dark-green-300 rounded-full text-xs">
                  ⏱️ {activity.duration}
                </span>
                <span className="px-2 py-1 bg-kashmir-light-blue-100 dark:bg-kashmir-dark-blue-800 text-kashmir-light-blue-700 dark:text-kashmir-dark-blue-300 rounded-full text-xs">
                  👥 {activity.bestFor}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
