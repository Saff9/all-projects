// components/WeatherTrends.tsx
'use client';

interface WeatherTrendsProps {
  currentTemp: number;
}

export default function WeatherTrends({ currentTemp }: WeatherTrendsProps) {
  const trends = [
    { hour: 'Now', temp: currentTemp, icon: '🌤️' },
    { hour: '2PM', temp: currentTemp + 2, icon: '☀️' },
    { hour: '4PM', temp: currentTemp + 1, icon: '🌤️' },
    { hour: '6PM', temp: currentTemp - 1, icon: '🌅' },
    { hour: '8PM', temp: currentTemp - 3, icon: '🌙' },
    { hour: '10PM', temp: currentTemp - 5, icon: '🌙' }
  ];

  const maxTemp = Math.max(...trends.map(t => t.temp));
  const minTemp = Math.min(...trends.map(t => t.temp));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 mb-4">
        📈 Hourly Forecast
      </h3>
      
      <div className="flex items-end justify-between space-x-2 mb-6">
        {trends.map((trend, index) => {
          const height = ((trend.temp - minTemp) / (maxTemp - minTemp)) * 40 + 20;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 mb-1">
                {trend.icon}
              </div>
              <div
                className="w-full bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${height}px` }}
              />
              <div className="text-xs font-semibold text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300 mt-1">
                {trend.temp}°
              </div>
              <div className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500 mt-1">
                {trend.hour}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-kashmir-light-green-50 dark:bg-kashmir-dark-green-900 rounded-lg">
          <p className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">High</p>
          <p className="text-lg font-bold text-kashmir-light-green-600 dark:text-kashmir-dark-green-400">
            {maxTemp}°C
          </p>
        </div>
        <div className="text-center p-3 bg-kashmir-light-blue-50 dark:bg-kashmir-dark-blue-900 rounded-lg">
          <p className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">Low</p>
          <p className="text-lg font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
            {minTemp}°C
          </p>
        </div>
      </div>
    </div>
  );
}
