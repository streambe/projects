'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getEventStats,
  getTopNetworkers,
  getEncountersByHour,
  getEncounterTimeline,
  getRecentEncounters,
  getEncountersForExport,
  type EventStats,
  type TopNetworker,
  type HourlyData,
  type TimelineData,
  type RecentEncounter,
} from '@/lib/api/analytics';
import { getEventById } from '@/lib/api/events';
import { exportToCSV } from '@/lib/csv-export';
import StatCard from '@/components/analytics/stat-card';
import BarChart from '@/components/analytics/bar-chart';
import HorizontalBarChart from '@/components/analytics/horizontal-bar-chart';
import type { Event } from '@/lib/types';

type TimeRange = 'today' | '7days' | 'all';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') ?? '';

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [topNetworkers, setTopNetworkers] = useState<TopNetworker[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [recentEncounters, setRecentEncounters] = useState<RecentEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const days = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : 365;
      const [ev, st, top, hourly, tl, recent] = await Promise.all([
        getEventById(eventId),
        getEventStats(eventId),
        getTopNetworkers(eventId, 10),
        getEncountersByHour(eventId),
        getEncounterTimeline(eventId, days),
        getRecentEncounters(eventId, 10),
      ]);
      setEvent(ev);
      setStats(st);
      setTopNetworkers(top);
      setHourlyData(hourly);
      setTimeline(tl);
      setRecentEncounters(recent);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportEncounters = async () => {
    if (!eventId) return;
    setExporting(true);
    try {
      const data = await getEncountersForExport(eventId);
      exportToCSV(data, `encounters-${eventId.slice(0, 8)}`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportTopNetworkers = () => {
    const data = topNetworkers.map((n, i) => ({
      Rank: i + 1,
      Name: n.fullName,
      Company: n.company ?? '',
      Encounters: n.encounterCount,
    }));
    exportToCSV(data, `top-networkers-${eventId.slice(0, 8)}`);
  };

  if (!eventId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-slate-400">Select an event to view analytics.</p>
        <Link href="/events" className="text-teal-400 hover:text-teal-300 text-sm">
          Go to Events
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const checkInRate = stats && stats.totalParticipants > 0
    ? Math.round((stats.checkedIn / stats.totalParticipants) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/events/detail?id=${eventId}`}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            &larr; Back to Event
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {event?.name ?? 'Event'} <span className="text-slate-500 font-normal text-lg">Analytics</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {(['today', '7days', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
            >
              {range === 'today' ? 'Today' : range === '7days' ? '7 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Interactions"
          value={stats?.totalEncounters ?? 0}
        />
        <StatCard
          label="Unique Pairs"
          value={stats?.uniquePairs ?? 0}
        />
        <StatCard
          label="Avg per Person"
          value={stats?.avgEncountersPerPerson ?? 0}
        />
        <StatCard
          label="Check-in Rate"
          value={`${checkInRate}%`}
          subtitle={`${stats?.checkedIn ?? 0} / ${stats?.totalParticipants ?? 0}`}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactions over time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Interactions Over Time</h2>
            <button
              onClick={handleExportEncounters}
              disabled={exporting}
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          <BarChart
            data={timeline.map((t) => ({
              label: formatDate(t.date),
              value: t.count,
            }))}
          />
        </div>

        {/* Top Networkers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Top 10 Networkers</h2>
            <button
              onClick={handleExportTopNetworkers}
              disabled={topNetworkers.length === 0}
              className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
          {topNetworkers.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No encounters yet</p>
          ) : (
            <div className="space-y-2">
              {topNetworkers.map((n, i) => (
                <div
                  key={n.participantId}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-xs text-slate-600 w-5 text-right tabular-nums">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-400 shrink-0">
                    {n.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{n.fullName}</p>
                    {n.company && (
                      <p className="text-[11px] text-slate-600 truncate">{n.company}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-teal-400 tabular-nums">
                    {n.encounterCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Peak Hours</h2>
          <HorizontalBarChart
            data={hourlyData.map((h) => ({
              label: h.hour,
              value: h.count,
            }))}
          />
        </div>

        {/* Recent Encounters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Recent Encounters</h2>
          {recentEncounters.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No encounters yet</p>
          ) : (
            <div className="space-y-2">
              {recentEncounters.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-white truncate">{e.participantAName}</span>
                    <span className="text-slate-600 text-xs shrink-0">&harr;</span>
                    <span className="text-sm text-white truncate">{e.participantBName}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 shrink-0 ml-3 tabular-nums">
                    {formatTime(e.lastSeen)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
