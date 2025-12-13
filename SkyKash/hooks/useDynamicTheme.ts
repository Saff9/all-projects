// hooks/useDynamicTheme.ts
'use client';

import { useEffect } from 'react';

export function useDynamicTheme(weatherCondition: string, temperature: number) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    const themeClasses = [
      'theme-sunny', 'theme-rainy', 'theme-snowy', 'theme-cloudy',
      'theme-hot', 'theme-cold', 'theme-moderate', 'theme-stormy'
    ];
    themeClasses.forEach(className => root.classList.remove(className));

    // Apply theme based on weather condition
    const condition = weatherCondition.toLowerCase();
    if (condition.includes('sunny') || condition.includes('clear')) {
      root.classList.add('theme-sunny');
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      root.classList.add('theme-rainy');
    } else if (condition.includes('snow') || condition.includes('sleet')) {
      root.classList.add('theme-snowy');
    } else if (condition.includes('cloud')) {
      root.classList.add('theme-cloudy');
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      root.classList.add('theme-stormy');
    }

    // Apply theme based on temperature
    if (temperature > 30) {
      root.classList.add('theme-hot');
    } else if (temperature < 10) {
      root.classList.add('theme-cold');
    } else {
      root.classList.add('theme-moderate');
    }
  }, [weatherCondition, temperature]);
}
