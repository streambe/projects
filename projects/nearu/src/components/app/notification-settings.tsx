'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY_NEARBY = 'nearu_notify_nearby';
const STORAGE_KEY_SOUND = 'nearu_notify_sound';

function getStored(key: string, fallback: boolean): boolean {
  if (typeof localStorage === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return val === null ? fallback : val === 'true';
}

export interface NotificationPreferences {
  nearbyEnabled: boolean;
  soundEnabled: boolean;
}

export function getNotificationPreferences(): NotificationPreferences {
  return {
    nearbyEnabled: getStored(STORAGE_KEY_NEARBY, true),
    soundEnabled: getStored(STORAGE_KEY_SOUND, true),
  };
}

export function NotificationSettings() {
  const [nearbyEnabled, setNearbyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setNearbyEnabled(getStored(STORAGE_KEY_NEARBY, true));
    setSoundEnabled(getStored(STORAGE_KEY_SOUND, true));
  }, []);

  function toggleNearby() {
    const next = !nearbyEnabled;
    setNearbyEnabled(next);
    localStorage.setItem(STORAGE_KEY_NEARBY, String(next));
  }

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem(STORAGE_KEY_SOUND, String(next));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Notifications
      </h3>

      <div className="space-y-3">
        <ToggleRow
          label="Nearby alerts"
          description="Get notified when someone interesting is near you"
          enabled={nearbyEnabled}
          onToggle={toggleNearby}
        />
        <ToggleRow
          label="Sound"
          description="Play a sound with notifications"
          enabled={soundEnabled}
          onToggle={toggleSound}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition-colors hover:bg-slate-800/80"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <div
        className={`relative ml-3 h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-teal-500' : 'bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
