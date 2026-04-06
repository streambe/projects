'use client';

export function ScanningIndicator() {
  return (
    <div className="flex flex-col items-center gap-5 py-16">
      {/* Radar rings */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="absolute h-full w-full rounded-full border border-teal-500/20 animate-radar-pulse" />
        <span
          className="absolute h-full w-full rounded-full border border-teal-500/30 animate-radar-pulse"
          style={{ animationDelay: '800ms' }}
        />
        <span
          className="absolute h-full w-full rounded-full border border-teal-500/40 animate-radar-pulse"
          style={{ animationDelay: '1600ms' }}
        />
        <span className="absolute h-16 w-16 rounded-full bg-teal-500/10 backdrop-blur-sm" />
        <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 shadow-[0_0_24px_4px_rgba(20,184,166,0.5)]">
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-200">Scanning nearby</p>
        <p className="mt-1 text-xs text-slate-500">
          Looking for people around you...
        </p>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in-up">
      {/* Radar illustration */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg
          className="absolute inset-0 h-full w-full text-slate-800"
          fill="none"
          viewBox="0 0 100 100"
          stroke="currentColor"
          strokeWidth="1"
        >
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="18" />
          <line x1="50" y1="4" x2="50" y2="96" />
          <line x1="4" y1="50" x2="96" y2="50" />
        </svg>
        <svg
          className="absolute inset-0 h-full w-full text-teal-500/40"
          fill="none"
          viewBox="0 0 100 100"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{
            clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)',
          }}
        >
          <circle cx="50" cy="50" r="46" />
        </svg>
        <span className="relative h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_12px_2px_rgba(20,184,166,0.7)]" />
      </div>
      <div className="max-w-[260px]">
        <p className="text-sm font-medium text-slate-300">Nothing nearby yet</p>
        <p className="mt-1 text-xs text-slate-500">{message}</p>
      </div>
    </div>
  );
}

export function BleUnavailable() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
        <svg
          className="h-8 w-8 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M6.5 6.5l11 11M6.5 17.5l11-11M12 2v20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="max-w-[240px] text-sm text-slate-500">
        Enable Bluetooth to discover nearby attendees
      </p>
    </div>
  );
}
