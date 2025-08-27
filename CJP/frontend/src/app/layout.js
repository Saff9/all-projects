import { AppProvider } from '@/context/AppContext';
import './globals.css';

export const metadata = {
  title: 'CJP — CockRoach Janta Party',
  description: 'Tap-to-earn crypto mini-app on Telegram. Mine CJP coins, complete tasks, win PvP battles, and evolve your cockroach mascot.',
  keywords: 'CJP, CockRoach Janta Party, Telegram, tap to earn, crypto, TON, GameFi',
  robots: 'noindex, nofollow', // Mini Apps should not be crawled
  openGraph: {
    title: 'CJP — CockRoach Janta Party',
    description: 'The most ferocious tap-to-earn game on Telegram. Join the swarm!',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="format-detection" content="telephone=no" />

        {/*
          Telegram WebApp SDK — MUST load synchronously before any React code runs.
          This ensures window.Telegram.WebApp is available immediately on mount.
          Using a standard script tag (not next/script) to guarantee head-blocking load.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://telegram.org/js/telegram-web-app.js" />

        {/* DNS prefetch & preconnect for all external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://telegram.org" />
        <link rel="dns-prefetch" href="https://adsgram.co" />
        <link rel="dns-prefetch" href="https://libtl.com" />

        {/* Google Fonts — display=swap for non-render-blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols — variable font for all icon fills */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />

        {/* Ad SDKs — loaded async, non-blocking */}
        <script src="https://adsgram.co/sdk/v1/adcontroller.js" async defer />
        <script src="https://libtl.com/sdk.js" data-zone="11037745" data-sdk="show_11037745" async defer />
      </head>
      <body
        className="flex flex-col h-screen font-body-md text-on-surface select-none overflow-hidden"
        suppressHydrationWarning
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
