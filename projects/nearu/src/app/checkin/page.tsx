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

  const stepIndex =
    step === 'search' ? 0 : step === 'participant' ? 1 : step === 'beacon' ? 2 : 3;
  const steps = ['Search', 'Confirm', 'Beacon', 'Code'];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-app-ambient p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Step indicator */}
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {steps.map((label, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      current
                        ? 'border-teal-400 bg-teal-500/20 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.5)]'
                        : done
                        ? 'border-teal-500/60 bg-teal-500 text-white'
                        : 'border-slate-700 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {done ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      current
                        ? 'text-teal-300'
                        : done
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                      done ? 'bg-teal-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* SEARCH */}
        {step === 'search' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-500">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name or email..."
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-5 pl-14 pr-6 text-xl text-white placeholder:text-slate-600 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
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
          <div className="space-y-8 text-center animate-fade-in-up">
            <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-b from-teal-500/10 to-slate-900/40 p-10">
              {/* Success pulse background */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.15),transparent_60%)]" />

              <div className="relative space-y-5">
                {/* Checkmark */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-400 bg-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.6)]">
                  <svg
                    className="h-9 w-9 text-teal-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xl font-bold text-teal-300">
                    Check-in complete
                  </p>
                  <p className="mt-1 text-lg text-slate-300">
                    {selected?.full_name}
                  </p>
                </div>

                <div className="py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Access Code
                  </p>
                  <p
                    className="font-mono font-bold text-teal-300 tracking-[0.15em]"
                    style={{
                      fontSize: 'clamp(4rem, 14vw, 8rem)',
                      lineHeight: 1,
                      textShadow: '0 0 40px rgba(20,184,166,0.5)',
                    }}
                  >
                    {completedCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (completedCode) {
                        navigator.clipboard?.writeText(completedCode);
                      }
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-300 transition hover:bg-teal-500/20"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy code
                  </button>
                </div>

                <p className="mx-auto max-w-md text-sm text-slate-400">
                  Show this code to the attendee. They&apos;ll use it to log in
                  to the nearU app.
                </p>
              </div>
            </div>

            <button
              onClick={resetFlow}
              className="w-full rounded-xl bg-teal-500 px-6 py-5 text-xl font-bold text-white shadow-[0_20px_40px_-16px_rgba(20,184,166,0.7)] transition-all hover:-translate-y-0.5 hover:bg-teal-400 active:translate-y-0"
            >
              Next Check-in →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
