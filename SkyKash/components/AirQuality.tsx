// components/AirQuality.tsx
'use client';

interface AirQualityProps {
  city?: string;
}

export default function AirQuality({ city = "Srinagar" }: AirQualityProps) {
  // Mock AQI data - in real app, fetch from API
  const aqiData = {
    value: 45,
    level: "Good",
    description: "Air quality is satisfactory",
    recommendation: "Ideal for outdoor activities",
    pollutants: {
      pm25: 12,
      pm10: 20,
      no2: 8,
      so2: 5,
      o3: 25
    }
  };

  const getAqiColor = (value: number) => {
    if (value <= 50) return 'text-green-600';
    if (value <= 100) return 'text-yellow-600';
    if (value <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAqiBgColor = (value: number) => {
    if (value <= 50) return 'bg-green-100 dark:bg-green-900';
    if (value <= 100) return 'bg-yellow-100 dark:bg-yellow-900';
    if (value <= 150) return 'bg-orange-100 dark:bg-orange-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
        💨 Air Quality
      </h3>
      
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getAqiBgColor(aqiData.value)} mb-2`}>
          <span className={`text-2xl font-bold ${getAqiColor(aqiData.value)}`}>
            {aqiData.value}
          </span>
        </div>
        <p className="font-semibold text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
          {aqiData.level}
        </p>
        <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
          {aqiData.description}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">PM2.5</span>
          <span className="font-semibold">{aqiData.pollutants.pm25} μg/m³</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">PM10</span>
          <span className="font-semibold">{aqiData.pollutants.pm10} μg/m³</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">NO₂</span>
          <span className="font-semibold">{aqiData.pollutants.no2} μg/m³</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-kashmir-light-blue-50 dark:bg-kashmir-dark-blue-900 rounded-lg">
        <p className="text-sm text-kashmir-light-blue-700 dark:text-kashmir-dark-blue-300">
          💡 {aqiData.recommendation}
        </p>
      </div>
    </div>
  );
}
