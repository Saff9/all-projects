// src/lib/useReadingStreak.js
'use client';
import { useEffect, useState } from 'react';

export function useReadingStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastReadDate = localStorage.getItem('lastReadDate');
    const currentStreak = parseInt(localStorage.getItem('readingStreak') || '0');

    if (lastReadDate === today) {
      // Already read today, just return current streak
      setStreak(currentStreak);
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastReadDate === yesterday) {
      // Consecutive day
      const newStreak = currentStreak + 1;
      localStorage.setItem('readingStreak', newStreak);
      setStreak(newStreak);
    } else {
      // Streak broken or first visit
      localStorage.setItem('readingStreak', '1');
      setStreak(1);
    }
    localStorage.setItem('lastReadDate', today);
  }, []);

  return streak;
}
