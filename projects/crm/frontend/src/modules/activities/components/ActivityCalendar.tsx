import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import { IconChevronLeft, IconChevronRight } from '../../../components/ui/Icons';
import { Button } from '../../../components/ui/Button';
import type { Activity, ActivityType } from '../activities.types';

// ---------------------------------------------------------------------------
// Dot color mapping by activity type
// ---------------------------------------------------------------------------

const DOT_COLORS: Record<ActivityType, string> = {
  llamada: 'bg-blue-500',
  reunion: 'bg-violet-500',
  tarea: 'bg-emerald-500',
};

const TYPE_LABELS: Record<ActivityType, string> = {
  llamada: 'Llamada',
  reunion: 'Reunion',
  tarea: 'Tarea',
};

const TYPE_TEXT_COLORS: Record<ActivityType, string> = {
  llamada: 'text-blue-600',
  reunion: 'text-violet-600',
  tarea: 'text-emerald-600',
};

// ---------------------------------------------------------------------------
// Day names
// ---------------------------------------------------------------------------

const DAY_NAMES = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityCalendarProps {
  activities: Activity[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActivityCalendar({ activities }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedCellRef = useRef<HTMLButtonElement>(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        selectedCellRef.current &&
        !selectedCellRef.current.contains(e.target as Node)
      ) {
        setSelectedDay(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build calendar grid days (includes leading/trailing days to fill weeks)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group activities by date string for fast lookup
  const activitiesByDate = new Map<string, Activity[]>();
  for (const activity of activities) {
    const dateKey = format(new Date(activity.scheduledAt), 'yyyy-MM-dd');
    const existing = activitiesByDate.get(dateKey);
    if (existing) {
      existing.push(activity);
    } else {
      activitiesByDate.set(dateKey, [activity]);
    }
  }

  function getActivitiesForDay(day: Date): Activity[] {
    const key = format(day, 'yyyy-MM-dd');
    return activitiesByDate.get(key) ?? [];
  }

  function isCurrentMonth(day: Date): boolean {
    return day.getMonth() === currentMonth.getMonth() && day.getFullYear() === currentMonth.getFullYear();
  }

  function isWeekend(day: Date): boolean {
    const dow = getDay(day);
    return dow === 0 || dow === 6;
  }

  // Unique activity type dots for a given day (max one dot per type)
  function getUniqueDots(dayActivities: Activity[]): ActivityType[] {
    const types = new Set<ActivityType>();
    for (const a of dayActivities) {
      types.add(a.type);
    }
    return Array.from(types);
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
      {/* Header: month name + navigation */}
      <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Mes anterior"
            onClick={() => {
              setCurrentMonth((m) => subMonths(m, 1));
              setSelectedDay(null);
            }}
            icon={<IconChevronLeft width={16} height={16} />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDay(null);
            }}
          >
            Hoy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Mes siguiente"
            onClick={() => {
              setCurrentMonth((m) => addMonths(m, 1));
              setSelectedDay(null);
            }}
            icon={<IconChevronRight width={16} height={16} />}
          />
        </div>
      </div>

      {/* Day names row */}
      <div className="grid grid-cols-7 border-b border-surface-100">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayActivities = getActivitiesForDay(day);
          const dots = getUniqueDots(dayActivities);
          const inMonth = isCurrentMonth(day);
          const today = isToday(day);
          const selected = selectedDay && isSameDay(day, selectedDay);
          const weekend = isWeekend(day);

          return (
            <div key={day.toISOString()} className="relative">
              <button
                ref={selected ? selectedCellRef : undefined}
                type="button"
                onClick={() => {
                  if (dayActivities.length > 0) {
                    setSelectedDay(selected ? null : day);
                  }
                }}
                className={cn(
                  'flex min-h-[80px] w-full flex-col items-start border-b border-r border-surface-100 p-2 text-left transition-colors',
                  !inMonth && 'bg-gray-50/50',
                  inMonth && 'hover:bg-surface-50',
                  today && 'bg-brand-50 border-brand-200',
                  selected && 'ring-2 ring-brand-500 ring-inset',
                  dayActivities.length > 0 && 'cursor-pointer',
                  dayActivities.length === 0 && 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    !inMonth && 'text-gray-300',
                    inMonth && !weekend && 'text-gray-900',
                    inMonth && weekend && 'text-gray-400',
                    today && 'text-brand-700 font-bold',
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Activity dots */}
                {dots.length > 0 && (
                  <div className="mt-auto flex items-center gap-1 pt-1">
                    {dots.map((type) => (
                      <span
                        key={type}
                        className={cn('inline-block h-2 w-2 rounded-full', DOT_COLORS[type])}
                        title={TYPE_LABELS[type]}
                      />
                    ))}
                    {dayActivities.length > 3 && (
                      <span className="text-[10px] font-medium text-gray-400">
                        +{dayActivities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Day popup */}
              {selected && dayActivities.length > 0 && (
                <div
                  ref={popupRef}
                  className="absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-xl border border-surface-200 bg-white p-3 shadow-xl"
                >
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {format(day, "d 'de' MMMM", { locale: es })}
                  </p>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {dayActivities.map((activity) => (
                      <li key={activity.id} className="flex items-start gap-2">
                        <span
                          className={cn(
                            'mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full',
                            DOT_COLORS[activity.type],
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-xs font-medium', TYPE_TEXT_COLORS[activity.type])}>
                              {TYPE_LABELS[activity.type]}
                            </span>
                            <span className="text-gray-300">|</span>
                            <Link
                              to={`/clientes/${activity.clientId}`}
                              className="truncate text-xs text-brand-600 hover:text-brand-800 hover:underline"
                            >
                              {activity.client
                                ? `${activity.client.firstName} ${activity.client.lastName}`
                                : 'Ver cliente'}
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-surface-100 px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-500">Llamada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
          <span className="text-xs text-gray-500">Reunion</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500">Tarea</span>
        </div>
      </div>
    </div>
  );
}
