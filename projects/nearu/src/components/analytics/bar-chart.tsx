'use client';

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export default function BarChart({
  data,
  color = 'bg-teal-500',
  height = 200,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-600 text-sm"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex items-end gap-1"
        style={{ height }}
      >
        {data.map((d, i) => {
          const pct = (d.value / maxValue) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group"
            >
              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                {d.value}
              </span>
              <div
                className={`w-full rounded-t ${color} transition-all duration-300 min-h-[2px]`}
                style={{ height: `${Math.max(pct, 1)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-slate-600 truncate block">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
