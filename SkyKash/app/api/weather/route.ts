// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Srinagar';
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: 'Weather API key not configured' },
        { status: 500 }
      );
    }

    let weatherUrl;
    if (lat && lon) {
      // Use coordinates if available
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      // Use city name
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    }

    const [weatherResponse, uvResponse] = await Promise.all([
      fetch(weatherUrl),
      // UV index API (using openuv.io or similar - you'll need an API key)
      lat && lon ? 
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`) 
        : Promise.resolve(null)
    ]);

    if (!weatherResponse.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch weather data' },
        { status: weatherResponse.status }
      );
    }

    const weatherData = await weatherResponse.json();
    let uvData = null;

    if (uvResponse) {
      try {
        uvData = await uvResponse.json();
      } catch (err) {
        console.log('UV data not available');
      }
    }

    // Calculate UV risk level
    let uvRisk = 'Low';
    let uvProtection = 'No protection needed';
    
    if (uvData && uvData.value) {
      const uvValue = uvData.value;
      if (uvValue >= 11) {
        uvRisk = 'Extreme';
        uvProtection = 'Avoid being outside';
      } else if (uvValue >= 8) {
        uvRisk = 'Very High';
        uvProtection = 'Extra protection needed';
      } else if (uvValue >= 6) {
        uvRisk = 'High';
        uvProtection = 'Protection essential';
      } else if (uvValue >= 3) {
        uvRisk = 'Moderate';
        uvProtection = 'Protection recommended';
      }
    }

    return NextResponse.json({
      ...weatherData,
      uv: uvData ? {
        value: uvData.value,
        risk: uvRisk,
        protection: uvProtection
      } : null
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
