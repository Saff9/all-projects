// components/WeatherCard.tsx
import React from "react";

interface WeatherCardProps {
  weatherData: any; // Matches your existing weatherData prop type
  timeOfDay: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  weatherData, 
  timeOfDay 
}) => {
  // Extract data safely from your existing weatherData structure
  const location = weatherData?.name || "Kashmir";
  const temperature = Math.round(weatherData?.main?.temp || 0);
  const condition = weatherData?.weather?.[0]?.description || "Clear";
  const iconUrl = weatherData?.weather?.[0]?.icon 
    ? `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
    : "/icons/default-weather.svg";
  const high = Math.round(weatherData?.main?.temp_max || 0);
  const low = Math.round(weatherData?.main?.temp_min || 0);
  const updatedAt = "Updated now";

  return (
    <div
      className="max-w-sm mx-auto p-8 rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30
        shadow-2xl shadow-blue-500/25 text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #98D8C8 50%, #2E8B57 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-12 h-12 bg-white/20 rounded-full animate-bounce delay-100" />
      </div>

      <header className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-black drop-shadow-2xl mb-1">{location}</h2>
          <p className="text-blue-100 font-medium">{timeOfDay} Weather</p>
        </div>
        <time className="text-sm opacity-80 font-medium" dateTime={updatedAt}>
          {updatedAt}
        </time>
      </header>

      <div className="relative z-10 flex items-center space-x-6 mb-6">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
          <img
            src={iconUrl}
            alt={condition}
            className="w-16 h-16 drop-shadow-lg"
            loading="lazy"
          />
        </div>
        <div className="text-center">
          <p className="text-7xl font-black drop-shadow-2xl leading-none">
            {temperature}°
          </p>
          <p className="text-xl font-semibold capitalize text-blue-100 mt-2 tracking-wide">
            {condition}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4 text-sm opacity-90">
        <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <span className="block font-bold text-2xl drop-shadow-md">{high}°</span>
          <span>High</span>
        </div>
        <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <span className="block font-bold text-2xl drop-shadow-md">{low}°</span>
          <span>Low</span>
        </div>
      </div>

      <footer className="relative z-10 mt-8 text-center text-xs opacity-75 tracking-wide">
        ❄️ SkyKash — Kashmir's Weather Companion
      </footer>
    </div>
  );
};

export default WeatherCard;
