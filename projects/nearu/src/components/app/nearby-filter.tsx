'use client';

import { useState, useMemo } from 'react';
import type { Participant } from '@/lib/types';

export interface NearbyFilters {
  search: string;
  roles: string[];
  companies: string[];
}

interface NearbyFilterProps {
  participants: Participant[];
  filters: NearbyFilters;
  onApply: (filters: NearbyFilters) => void;
  onClose: () => void;
}

export const emptyFilters: NearbyFilters = {
  search: '',
  roles: [],
  companies: [],
};

export function hasActiveFilters(f: NearbyFilters): boolean {
  return f.search !== '' || f.roles.length > 0 || f.companies.length > 0;
}

export function applyFilters(
  participant: Participant,
  filters: NearbyFilters,
): boolean {
  if (
    filters.search &&
    !participant.full_name.toLowerCase().includes(filters.search.toLowerCase())
  ) {
    return false;
  }
  if (
    filters.roles.length > 0 &&
    (!participant.role || !filters.roles.includes(participant.role))
  ) {
    return false;
  }
  if (
    filters.companies.length > 0 &&
    (!participant.company || !filters.companies.includes(participant.company))
  ) {
    return false;
  }
  return true;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? 'border-teal-500/40 bg-teal-500/20 text-teal-300'
          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

export function NearbyFilter({
  participants,
  filters,
  onApply,
  onClose,
}: NearbyFilterProps) {
  const [draft, setDraft] = useState<NearbyFilters>({ ...filters });

  const roles = useMemo(() => {
    const set = new Set<string>();
    for (const p of participants) {
      if (p.role) set.add(p.role);
    }
    return Array.from(set).sort();
  }, [participants]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const p of participants) {
      if (p.company) set.add(p.company);
    }
    return Array.from(set).sort();
  }, [participants]);

  function toggleChip(
    key: 'roles' | 'companies',
    value: string,
  ) {
    setDraft((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold text-white">Filter</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            value={draft.search}
            onChange={(e) => setDraft((p) => ({ ...p, search: e.target.value }))}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Role
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  active={draft.roles.includes(r)}
                  onClick={() => toggleChip('roles', r)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Companies */}
        {companies.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Company
            </p>
            <div className="flex flex-wrap gap-2">
              {companies.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={draft.companies.includes(c)}
                  onClick={() => toggleChip('companies', c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-3 pb-8 pt-4">
          <button
            onClick={() => {
              onApply(emptyFilters);
              onClose();
            }}
            className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Clear
          </button>
          <button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
