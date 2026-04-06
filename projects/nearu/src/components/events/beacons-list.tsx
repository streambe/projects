'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { createBeacons } from '@/lib/api/beacons';

interface BeaconRow {
  id: string;
  major: number;
  minor: number;
  hardware_id: string | null;
  status: 'available' | 'assigned' | 'retired';
  event_id: string | null;
}

export default function BeaconsList({ eventId }: { eventId: string }) {
  const [beacons, setBeacons] = useState<BeaconRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeacons = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('beacons')
        .select('*')
        .eq('event_id', eventId)
        .order('minor', { ascending: true });

      if (fetchError) throw fetchError;
      setBeacons(data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchBeacons();
  }, [fetchBeacons]);

  async function handleAddBeacons(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const rangeStr = fd.get('range') as string;
    const major = parseInt(fd.get('major') as string) || 1;

    // Parse range like "1-100" or "1"
    const parts = rangeStr.split('-').map((s) => parseInt(s.trim()));
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : parts[0];

    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      setError('Invalid range. Use format: 1-100');
      setSaving(false);
      return;
    }

    if (end - start + 1 > 500) {
      setError('Maximum 500 beacons at once.');
      setSaving(false);
      return;
    }

    try {
      await createBeacons(eventId, start, end, major);
      setShowAdd(false);
      await fetchBeacons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create beacons');
    } finally {
      setSaving(false);
    }
  }

  const statusStyles: Record<string, string> = {
    available: 'bg-teal-500/10 text-teal-400',
    assigned: 'bg-yellow-500/10 text-yellow-400',
    retired: 'bg-slate-500/10 text-slate-500',
  };

  const counts = {
    available: beacons.filter((b) => b.status === 'available').length,
    assigned: beacons.filter((b) => b.status === 'assigned').length,
    retired: beacons.filter((b) => b.status === 'retired').length,
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-slate-800 rounded w-full" />
          <div className="h-8 bg-slate-800 rounded w-full" />
          <div className="h-8 bg-slate-800 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-400">{counts.available}</p>
          <p className="text-xs text-slate-500 mt-1">Available</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{counts.assigned}</p>
          <p className="text-xs text-slate-500 mt-1">Assigned</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-500">{counts.retired}</p>
          <p className="text-xs text-slate-500 mt-1">Retired</p>
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Beacons
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-medium mb-3">Add Beacons</h3>
          <form onSubmit={handleAddBeacons} className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Minor ID Range *</label>
              <input
                name="range"
                required
                placeholder="1-100"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500 w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Major ID</label>
              <input
                name="major"
                type="number"
                defaultValue={1}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-20 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <p className="text-xs text-slate-600 mt-2">
            Labels are auto-generated as B-001, B-002, etc. based on minor ID.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Minor</th>
                <th className="px-4 py-3">Major</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {beacons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No beacons configured. Add a range to get started.
                  </td>
                </tr>
              ) : (
                beacons.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-white">{b.hardware_id ?? `B-${String(b.minor).padStart(3, '0')}`}</td>
                    <td className="px-4 py-3 text-slate-400">{b.minor}</td>
                    <td className="px-4 py-3 text-slate-400">{b.major}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          {beacons.length} beacons total
        </div>
      </div>
    </div>
  );
}
