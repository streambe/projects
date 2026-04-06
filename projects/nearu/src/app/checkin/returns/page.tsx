'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { returnBeacon } from '@/lib/api/beacons';

export default function BeaconReturnsPage() {
  const [beaconInput, setBeaconInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleReturn() {
    if (!beaconInput.trim()) return;
    setProcessing(true);
    setResult(null);

    try {
      const minorNum = parseInt(beaconInput);
      let query = supabase.from('beacons').select('*');

      if (!isNaN(minorNum) && beaconInput.match(/^\d+$/)) {
        query = query.eq('minor', minorNum);
      } else {
        query = query.eq('hardware_id', beaconInput.toUpperCase().trim());
      }

      const { data: beacons, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const beacon = beacons?.find((b) => b.status === 'assigned') ?? beacons?.[0];
      if (!beacon) {
        setResult({ success: false, message: `Beacon "${beaconInput}" not found.` });
        setProcessing(false);
        return;
      }

      if (beacon.status !== 'assigned') {
        setResult({ success: false, message: `Beacon "${beaconInput}" is not currently assigned.` });
        setProcessing(false);
        return;
      }

      await returnBeacon(beacon.id);
      setResult({ success: true, message: `Beacon ${beacon.hardware_id ?? beaconInput} returned successfully.` });
      setBeaconInput('');
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Return failed' });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Beacon Return</h2>
        <p className="text-slate-400 text-center text-sm">
          Enter the beacon label or minor ID to mark it as returned.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={beaconInput}
            onChange={(e) => setBeaconInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReturn()}
            placeholder="B-001 or 1"
            autoFocus
            className="w-full px-6 py-5 bg-slate-900 border border-slate-700 rounded-xl text-white text-2xl text-center font-mono placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          <button
            onClick={handleReturn}
            disabled={processing || !beaconInput.trim()}
            className="w-full px-6 py-5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-lg font-bold rounded-xl transition-colors"
          >
            {processing ? 'Processing...' : 'Return Beacon'}
          </button>
        </div>

        {result && (
          <div
            className={`rounded-xl p-4 text-center text-sm ${
              result.success
                ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
