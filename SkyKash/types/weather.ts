// types/weather.ts
export interface WeatherData {
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

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface WeatherCardProps {
  weatherData: WeatherData;
  timeOfDay?: string;
}
