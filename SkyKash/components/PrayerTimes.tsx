// components/PrayerTimes.tsx
'use client';

import { useState, useEffect } from 'react';

export default function PrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "05:30",
    sunrise: "06:45",
    dhuhr: "12:30",
    asr: "15:45",
    maghrib: "18:15",
    isha: "19:30"
  });

  const [islamicDate, setIslamicDate] = useState("");

  useEffect(() => {
    // Calculate Islamic date (simplified)
    const today = new Date();
    const islamicMonths = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", 
      "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];
    
    const randomDay = Math.floor(Math.random() * 29) + 1;
    const randomMonth = islamicMonths[Math.floor(Math.random() * 12)];
    const randomYear = 1445 + Math.floor(Math.random() * 2);
    
    setIslamicDate(`${randomDay} ${randomMonth} ${randomYear} AH`);
  }, []);

  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha }
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      if (prayerTime > currentTime) {
        return { ...prayer, minutesLeft: prayerTime - currentTime };
      }
    }
    
    return { name: "Fajr", time: prayerTimes.fajr, minutesLeft: 24 * 60 - currentTime };
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200">
          🕌 Prayer Times
        </h3>
        <span className="text-sm text-kashmir-light-green-600 dark:text-kashmir-dark-green-400">
          {islamicDate}
        </span>
      </div>

      {/* Next Prayer */}
      <div className="bg-kashmir-light-green-50 dark:bg-kashmir-dark-green-900 rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
            Next Prayer
          </p>
          <p className="text-xl font-bold text-kashmir-light-green-700 dark:text-kashmir-dark-green-300">
            {nextPrayer.name}
          </p>
          <p className="text-sm text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
            in {nextPrayer.minutesLeft} minutes
          </p>
        </div>
      </div>

      {/* All Prayer Times */}
      <div className="space-y-3">
        {Object.entries(prayerTimes).map(([prayer, time]) => (
          <div key={prayer} className="flex justify-between items-center">
            <span className="capitalize text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
              {prayer}
            </span>
            <span className={`font-semibold ${
              prayer === nextPrayer.name.toLowerCase() 
                ? 'text-kashmir-light-green-600 dark:text-kashmir-dark-green-400' 
                : 'text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300'
            }`}>
              {time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
