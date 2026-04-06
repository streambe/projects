'use client';

interface HorizontalBarChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export default function HorizontalBarChart({
  data,
  color = 'bg-teal-500',
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-600 text-sm h-32">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const pct = (d.value / maxValue) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-14 text-right shrink-0 tabular-nums">
              {d.label}
            </span>
            <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden">
              <div
                className={`h-full ${color} rounded transition-all duration-300`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 tabular-nums">{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}
