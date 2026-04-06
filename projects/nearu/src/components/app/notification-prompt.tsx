'use client';

import { useEffect, useState } from 'react';
import { requestPermission, hasPermission } from '@/lib/notifications';

const DISMISSED_KEY = 'nearu_notify_prompt_dismissed';

/**
 * One-time notification permission prompt.
 * Shows after login if permission hasn't been granted or dismissed.
 */
export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already granted, denied permanently, or dismissed
    if (hasPermission()) return;
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
    // Check if browser denied permanently
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') return;

    setVisible(true);
  }, []);

  if (!visible) return null;

  async function handleEnable() {
    await requestPermission();
    setVisible(false);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/20">
          <svg
            className="h-7 w-7 text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-lg font-semibold text-white">
          Stay in the loop
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          nearU needs notifications to alert you when interesting people are
          nearby. You won&apos;t miss a connection.
        </p>

        <button
          onClick={handleEnable}
          className="mb-3 w-full rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-400 active:scale-[0.98]"
        >
          Enable Notifications
        </button>

        <button
          onClick={handleDismiss}
          className="text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
