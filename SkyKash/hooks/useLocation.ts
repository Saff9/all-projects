// hooks/useLocation.ts
'use client';

import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          const data = await response.json();
          
          setLocation({
            latitude,
            longitude,
            city: data.city || data.locality || 'Unknown City',
            country: data.countryName || 'Unknown Country'
          });
        } catch (err) {
          setError('Failed to get location information');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  return { location, loading, error };
}
