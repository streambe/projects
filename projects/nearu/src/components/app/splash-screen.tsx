'use client';

import { useEffect } from 'react';

interface SplashScreenProps {
  onReady?: () => void;
  duration?: number;
}

export function SplashScreen({ onReady, duration = 1500 }: SplashScreenProps) {
  useEffect(() => {
    if (!onReady) return;
    const timer = setTimeout(onReady, duration);
    return () => clearTimeout(timer);
  }, [onReady, duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <svg viewBox="0 0 512 512" className="h-32 w-32 animate-pulse">
          <rect width="512" height="512" rx="96" fill="#0f172a" />
          <circle cx="200" cy="256" r="80" fill="none" stroke="#14b8a6" strokeWidth="24" />
          <circle cx="312" cy="256" r="80" fill="none" stroke="#14b8a6" strokeWidth="24" />
          <circle cx="200" cy="256" r="16" fill="#14b8a6" />
          <circle cx="312" cy="256" r="16" fill="#14b8a6" />
        </svg>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">nearU</h1>
          <p className="mt-1 text-sm text-slate-400">Discover people near you</p>
        </div>
      </div>
    </div>
  );
}
