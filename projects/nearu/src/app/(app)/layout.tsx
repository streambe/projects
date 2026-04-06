'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn, clearSession } from '@/lib/auth';
import { NotificationPrompt } from '@/components/app/notification-prompt';
import { SyncStatus } from '@/components/app/sync-status';
import { cleanupPushNotifications } from '@/lib/push-setup';
import { clearBeaconCache } from '@/lib/api/beacon-resolver';

const NAV_ITEMS = [
  { href: '/nearby', label: 'Nearby', icon: NavIconNearby },
  { href: '/history', label: 'History', icon: NavIconHistory },
  { href: '/profile', label: 'Profile', icon: NavIconProfile },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setReady(true);
      return;
    }
    if (!isLoggedIn()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  const isLogin = pathname === '/login';

  if (!ready && !isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Notification permission prompt (shows once) */}
      <NotificationPrompt />

      <main className="flex-1">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`flex flex-col items-center gap-1 px-4 py-1 text-xs transition ${
                  active ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon active={active} />
                {label}
              </button>
            );
          })}
          {/* Sync status indicator in the nav bar */}
          <SyncStatus />
        </div>
      </nav>
    </div>
  );
}

/** Logout helper — clears session, push, cache, and redirects. */
export async function performLogout(router: ReturnType<typeof useRouter>) {
  await cleanupPushNotifications();
  clearBeaconCache();
  clearSession();
  router.replace('/login');
}

function NavIconNearby({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      <path d="M12 6a6 6 0 0 1 6 6" strokeLinecap="round" />
    </svg>
  );
}

function NavIconHistory({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavIconProfile({ active }: { active: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
