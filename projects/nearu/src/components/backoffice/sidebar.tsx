'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/events',
    label: 'Events',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-20 shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5 md:px-6">
        <Link
          href="/events"
          className="flex items-center gap-2.5 font-bold tracking-tight"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 shadow-[0_8px_20px_-8px_rgba(20,184,166,0.7)]">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="12" cy="12" r="2.5" />
              <path d="M12 4a8 8 0 0 1 8 8" strokeLinecap="round" />
              <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden text-lg md:inline">
            near<span className="text-teal-400">U</span>
            <span className="ml-1.5 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Admin
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4 md:px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500/10 text-teal-300'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
              title={item.label}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
              )}
              <span className={isActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-slate-800 p-4 text-xs text-slate-600 md:block">
        nearU v0.1.0
      </div>
    </aside>
  );
}
