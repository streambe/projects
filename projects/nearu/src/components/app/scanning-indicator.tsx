'use client';

export function ScanningIndicator() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      {/* Radar rings */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-teal-500/10" />
        <span className="absolute h-3/4 w-3/4 animate-ping rounded-full bg-teal-500/15 [animation-delay:300ms]" />
        <span className="absolute h-1/2 w-1/2 animate-ping rounded-full bg-teal-500/20 [animation-delay:600ms]" />
        <span className="h-4 w-4 rounded-full bg-teal-500" />
      </div>
      <p className="text-sm text-slate-400">Scanning for nearby people...</p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <svg
        className="h-12 w-12 text-slate-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="max-w-[240px] text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function BleUnavailable() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <svg
        className="h-12 w-12 text-slate-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M6.5 6.5l11 11M6.5 17.5l11-11M12 2v20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="max-w-[240px] text-sm text-slate-500">
        Enable Bluetooth to discover nearby attendees
      </p>
    </div>
  );
}
