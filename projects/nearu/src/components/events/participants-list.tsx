'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { createParticipant, bulkCreateParticipants } from '@/lib/api/participants';
import { createEventParticipant } from '@/lib/api/events';

interface ParticipantRow {
  id: string;
  participant_id: string;
  access_code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  beacon_id: string | null;
  participants: {
    id: string;
    full_name: string;
    email: string | null;
    company: string | null;
    role: string | null;
  };
  beacons?: { hardware_id: string | null; minor: number } | null;
}

export default function ParticipantsList({ eventId }: { eventId: string }) {
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          *,
          participants (*),
          beacons:beacon_id (hardware_id, minor)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      setRows((data as unknown as ParticipantRow[]) ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.participants.full_name.toLowerCase().includes(q) ||
      (r.participants.email?.toLowerCase().includes(q) ?? false) ||
      (r.participants.company?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleAddParticipant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const full_name = fd.get('full_name') as string;
    const email = (fd.get('email') as string) || undefined;
    const company = (fd.get('company') as string) || undefined;
    const role = (fd.get('role') as string) || undefined;

    try {
      const participant = await createParticipant({ full_name, email, company, role });
      await createEventParticipant(eventId, participant.id);
      setShowAddForm(false);
      await fetchParticipants();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setImportResult({ created: 0, errors: ['CSV must have a header row and at least one data row'] });
        setSaving(false);
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const nameIdx = headers.findIndex((h) => h === 'full_name' || h === 'name');
      const firstIdx = headers.findIndex((h) => h === 'first_name');
      const lastIdx = headers.findIndex((h) => h === 'last_name');
      const emailIdx = headers.findIndex((h) => h === 'email');
      const companyIdx = headers.findIndex((h) => h === 'company');
      const roleIdx = headers.findIndex((h) => h === 'role');

      const participants = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));
        let full_name = '';
        if (nameIdx >= 0) {
          full_name = cols[nameIdx] || '';
        } else if (firstIdx >= 0) {
          full_name = [cols[firstIdx], cols[lastIdx] ?? ''].filter(Boolean).join(' ');
        }
        if (!full_name) continue;

        participants.push({
          full_name,
          email: emailIdx >= 0 ? cols[emailIdx] || undefined : undefined,
          company: companyIdx >= 0 ? cols[companyIdx] || undefined : undefined,
          role: roleIdx >= 0 ? cols[roleIdx] || undefined : undefined,
        });
      }

      const result = await bulkCreateParticipants(eventId, participants);
      setImportResult(result);
      await fetchParticipants();
    } catch (err) {
      setImportResult({ created: 0, errors: [err instanceof Error ? err.message : 'Import failed'] });
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-slate-800 rounded w-full" />
          <div className="h-8 bg-slate-800 rounded w-full" />
          <div className="h-8 bg-slate-800 rounded w-full" />
          <div className="h-8 bg-slate-800 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
        />
        <button
          onClick={() => { setShowAddForm(!showAddForm); setShowImport(false); }}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          + Add Participant
        </button>
        <button
          onClick={() => { setShowImport(!showImport); setShowAddForm(false); }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 whitespace-nowrap"
        >
          Import CSV
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-medium mb-3">Add Participant</h3>
          <form onSubmit={handleAddParticipant} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input name="full_name" required placeholder="Full Name *" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500" />
            <input name="email" type="email" placeholder="Email" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500" />
            <input name="company" placeholder="Company" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500" />
            <div className="flex gap-2">
              <input name="role" placeholder="Role" className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-teal-500" />
              <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? '...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import */}
      {showImport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-medium mb-2">Import from CSV</h3>
          <p className="text-xs text-slate-500 mb-3">
            CSV headers: full_name (or first_name + last_name), email, company, role
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleCSVImport}
            disabled={saving}
            className="text-sm text-slate-400 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-teal-600"
          />
          {saving && <p className="text-sm text-teal-400 mt-2">Importing...</p>}
          {importResult && (
            <div className="mt-3 text-sm">
              <p className="text-teal-400">{importResult.created} participants imported.</p>
              {importResult.errors.length > 0 && (
                <div className="mt-1 text-red-400">
                  {importResult.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Beacon</th>
                <th className="px-4 py-3">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {search ? 'No participants match your search.' : 'No participants yet. Add one or import a CSV.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{r.participants.full_name}</td>
                    <td className="px-4 py-3 text-slate-400">{r.participants.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.participants.company ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{r.participants.role ?? '-'}</td>
                    <td className="px-4 py-3">
                      {r.checked_in ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full">
                          Checked in
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">Not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {r.beacons?.hardware_id ?? '-'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-teal-400">{r.access_code}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          {filtered.length} of {rows.length} participants
        </div>
      </div>
    </div>
  );
}
