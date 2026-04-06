import * as React from 'react';

type Variant = 'text' | 'avatar' | 'card' | 'block';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Skeleton({
  variant = 'block',
  className = '',
  style,
  ...rest
}: SkeletonProps) {
  const base = 'animate-shimmer rounded-md';

  const variantClass: Record<Variant, string> = {
    text: 'h-3 w-full rounded',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-24 w-full rounded-2xl',
    block: 'h-4 w-full',
  };

  return (
    <div
      className={`${base} ${variantClass[variant]} ${className}`}
      style={style}
      aria-hidden="true"
      {...rest}
    />
  );
}

/** Card-shaped skeleton row for nearby/history lists. */
export function SkeletonPersonCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  );
}

/** Bigger event card skeleton for backoffice. */
export function SkeletonEventCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
