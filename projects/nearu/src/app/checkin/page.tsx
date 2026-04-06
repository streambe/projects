'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { assignBeacon } from '@/lib/api/beacons';
import { useCheckinEvent } from './layout';

interface ParticipantResult {
  ep_id: string;
  participant_id: string;
  full_name: string;
  email: string | null;
  company: string | null;
  role: string | null;
  access_code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  beacon_id: string | null;
}

type Step = 'search' | 'participant' | 'beacon' | 'done';

export default function CheckinPage() {
  const { eventId } = useCheckinEvent();
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [selected, setSelected] = useState<ParticipantResult | null>(null);
  const [beaconInput, setBeaconInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedCode, setCompletedCode] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('event_participants')
        .select(`
          id,
          participant_id,
          access_code,
          checked_in,
          checked_in_at,
          beacon_id,
          participants!inner (full_name, email, company, role)
        `)
        .eq('event_id', eventId)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`, { referencedTable: 'participants' });

      if (fetchError) throw fetchError;

      const mapped: ParticipantResult[] = (data ?? []).map((row: Record<string, unknown>) => {
        const p = row.participants as Record<string, unknown>;
        return {
          ep_id: row.id as string,
          participant_id: row.participant_id as string,
          full_name: p.full_name as string,
          email: (p.email as string) ?? null,
          company: (p.company as string) ?? null,
          role: (p.role as string) ?? null,
          access_code: row.access_code as string,
          checked_in: row.checked_in as boolean,
          checked_in_at: (row.checked_in_at as string) ?? null,
          beacon_id: (row.beacon_id as string) ?? null,
        };
      });

      setResults(mapped);
      if (mapped.length === 1) {
        setSelected(mapped[0]);
        setStep('participant');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  function selectParticipant(p: ParticipantResult) {
    setSelected(p);
    setStep('participant');
  }

  async function handleCheckin() {
    if (!selected || !beaconInput.trim()) return;
    setProcessing(true);
    setError(null);

    try {
      const minorNum = parseInt(beaconInput);
      let beaconQuery = supabase
        .from('beacons')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'available');

      if (!isNaN(minorNum) && beaconInput.match(/^\d+$/)) {
        beaconQuery = beaconQuery.eq('minor', minorNum);
      } else {
        beaconQuery = beaconQuery.eq('hardware_id', beaconInput.toUpperCase().trim());
      }

      const { data: beacon, error: beaconError } = await beaconQuery.maybeSingle();
      if (beaconError) throw beaconError;
      if (!beacon) {
        setError(`Beacon "${beaconInput}" not found or not available.`);
        setProcessing(false);
        return;
      }

      await assignBeacon(beacon.id, selected.ep_id);

      const { error: checkinError } = await supabase
        .from('event_participants')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          beacon_id: beacon.id,
        })
        .eq('id', selected.ep_id);

      if (checkinError) throw checkinError;

      setCompletedCode(selected.access_code);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setProcessing(false);
    }
  }

  function resetFlow() {
    setStep('search');
    setQuery('');
    setResults([]);
    setSelected(null);
    setBeaconInput('');
    setError(null);
    setCompletedCode(null);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
          <span className={step === 'search' ? 'text-teal-400 font-bold' : ''}>Search</span>
          <span>{'>'}</span>
          <span className={step === 'participant' ? 'text-teal-400 font-bold' : ''}>Confirm</span>
          <span>{'>'}</span>
          <span className={step === 'beacon' || step === 'done' ? 'text-teal-400 font-bold' : ''}>Check-in</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* SEARCH */}
        {step === 'search' && (
          <div className="space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email..."
                autoFocus
                className="flex-1 px-6 py-5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xl placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                className="px-8 py-5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-lg font-bold rounded-xl transition-colors"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((r) => (
                  <button
                    key={r.ep_id}
                    onClick={() => selectParticipant(r)}
                    className="w-full px-6 py-4 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl text-left transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-lg font-medium group-hover:text-teal-400 transition-colors">
                        {r.full_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {[r.email, r.company, r.role].filter(Boolean).join(' - ')}
                      </p>
                    </div>
                    {r.checked_in && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                        Already checked in
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PARTICIPANT CARD */}
        {step === 'participant' && selected && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <p className="text-3xl font-bold">{selected.full_name}</p>
              {selected.email && <p className="text-lg text-slate-400">{selected.email}</p>}
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                {selected.company && <span>{selected.company}</span>}
                {selected.role && <span>{selected.role}</span>}
              </div>
              {selected.checked_in && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-sm">
                  Already checked in at {selected.checked_in_at ? new Date(selected.checked_in_at).toLocaleTimeString() : 'unknown'}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('search'); setSelected(null); }}
                className="flex-1 px-6 py-5 bg-slate-800 hover:bg-slate-700 text-white text-lg font-medium rounded-xl transition-colors border border-slate-700"
              >
                Back
              </button>
              <button
                onClick={() => setStep('beacon')}
                disabled={selected.checked_in}
                className="flex-1 px-6 py-5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-lg font-bold rounded-xl transition-colors"
              >
                Assign Beacon
              </button>
            </div>
          </div>
        )}

        {/* BEACON INPUT */}
        {step === 'beacon' && selected && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <p className="text-xl font-bold">{selected.full_name}</p>
              <p className="text-sm text-slate-500 mt-1">{selected.email}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-slate-400 text-center">
                Enter beacon label (e.g. B-001) or minor ID
              </label>
              <input
                type="text"
                value={beaconInput}
                onChange={(e) => setBeaconInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
                placeholder="B-001 or 1"
                autoFocus
                className="w-full px-6 py-5 bg-slate-900 border border-slate-700 rounded-xl text-white text-2xl text-center font-mono placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('participant')}
                className="flex-1 px-6 py-5 bg-slate-800 hover:bg-slate-700 text-white text-lg font-medium rounded-xl transition-colors border border-slate-700"
              >
                Back
              </button>
              <button
                onClick={handleCheckin}
                disabled={processing || !beaconInput.trim()}
                className="flex-1 px-6 py-5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-xl font-bold rounded-xl transition-colors uppercase tracking-wider"
              >
                {processing ? 'Processing...' : 'CHECK IN'}
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="space-y-8 text-center">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-10 space-y-4">
              <div className="text-teal-400 text-lg font-medium">Check-in complete!</div>
              <p className="text-slate-400">{selected?.full_name}</p>
              <div className="py-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Access Code</p>
                <p className="text-6xl font-bold font-mono text-white tracking-[0.3em]">
                  {completedCode}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Show this code to the attendee. They will use it to log in to the app.
              </p>
            </div>

            <button
              onClick={resetFlow}
              className="w-full px-6 py-5 bg-teal-500 hover:bg-teal-600 text-white text-xl font-bold rounded-xl transition-colors"
            >
              Next Check-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
