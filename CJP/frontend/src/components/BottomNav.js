'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Mine', path: '/home', icon: 'home', iconFill: 'home' },
    { name: 'Shop', path: '/shop', icon: 'storefront', iconFill: 'storefront' },
    { name: 'Games', path: '/games', icon: 'sports_esports', iconFill: 'sports_esports' },
    { name: 'Tasks', path: '/tasks', icon: 'assignment', iconFill: 'assignment' },
    { name: 'Wallet', path: '/wallet', icon: 'account_balance_wallet', iconFill: 'account_balance_wallet' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(8, 8, 8, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255, 191, 0, 0.12)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.6)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 8px 10px',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '6px 12px',
                borderRadius: '14px',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(255,191,0,0.18), rgba(255,191,0,0.08))'
                  : 'transparent',
                boxShadow: isActive
                  ? '0 0 12px rgba(255,191,0,0.2), inset 0 0 1px rgba(255,191,0,0.3)'
                  : 'none',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                minWidth: 52,
                textDecoration: 'none',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  color: isActive ? '#ffbf00' : '#6b6b6b',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(255,191,0,0.6))' : 'none',
                  transition: 'all 0.2s ease',
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'var(--font-label-mono)',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? '#ffbf00' : '#555',
                  transition: 'color 0.2s ease',
                  lineHeight: 1,
                }}
              >
                {item.name}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#ffbf00',
                    boxShadow: '0 0 6px rgba(255,191,0,0.8)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
