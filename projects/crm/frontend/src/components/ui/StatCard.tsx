import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-surface-200 bg-white p-5 shadow-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs font-semibold',
                trend.positive ? 'text-emerald-600' : 'text-red-500',
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          {icon}
        </div>
      </div>
    </div>
  );
}
