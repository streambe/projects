'use client';

import { useEffect, useState } from 'react';
import { getQueueSize } from '@/lib/offline-store';

export function SyncStatus() {
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    setQueued(getQueueSize());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue size
    const id = setInterval(() => setQueued(getQueueSize()), 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(id);
    };
  }, []);

  // Hide when online and nothing queued
  if (online && queued === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          online ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
        }`}
      />
      {!online && (
        <span className="text-amber-300">
          Offline{queued > 0 ? ` \u00b7 ${queued} queued` : ''}
        </span>
      )}
      {online && queued > 0 && (
        <span className="text-slate-400">Syncing {queued}...</span>
      )}
    </div>
  );
}
