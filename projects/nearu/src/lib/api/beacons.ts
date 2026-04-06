import { supabase } from '@/lib/supabase';
import type { Beacon } from '@/lib/types';

export async function getEventBeacons(eventId: string): Promise<Beacon[]> {
  const { data, error } = await supabase
    .from('beacons')
    .select('*')
    .eq('event_id', eventId)
    .order('minor', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createBeacons(
  eventId: string,
  minorStart: number,
  minorEnd: number,
  major: number = 1
): Promise<Beacon[]> {
  const beacons = [];
  for (let minor = minorStart; minor <= minorEnd; minor++) {
    beacons.push({
      event_id: eventId,
      major,
      minor,
      hardware_id: `B-${String(minor).padStart(3, '0')}`,
      status: 'available' as const,
    });
  }

  const { data, error } = await supabase
    .from('beacons')
    .insert(beacons)
    .select('*');

  if (error) throw error;
  return data ?? [];
}

export async function assignBeacon(
  beaconId: string,
  eventParticipantId: string
): Promise<void> {
  const { error: beaconError } = await supabase
    .from('beacons')
    .update({ status: 'assigned' })
    .eq('id', beaconId);

  if (beaconError) throw beaconError;

  const { error: epError } = await supabase
    .from('event_participants')
    .update({ beacon_id: beaconId })
    .eq('id', eventParticipantId);

  if (epError) throw epError;
}

export async function returnBeacon(beaconId: string): Promise<void> {
  // Clear assignment from event_participants
  const { error: epError } = await supabase
    .from('event_participants')
    .update({ beacon_id: null })
    .eq('beacon_id', beaconId);

  if (epError) throw epError;

  const { error: beaconError } = await supabase
    .from('beacons')
    .update({ status: 'available' })
    .eq('id', beaconId);

  if (beaconError) throw beaconError;
}

export async function getBeaconByHardwareId(
  eventId: string,
  hardwareId: string
): Promise<Beacon | null> {
  const { data, error } = await supabase
    .from('beacons')
    .select('*')
    .eq('event_id', eventId)
    .eq('hardware_id', hardwareId.toUpperCase().trim())
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBeaconByMinor(
  eventId: string,
  minor: number
): Promise<Beacon | null> {
  const { data, error } = await supabase
    .from('beacons')
    .select('*')
    .eq('event_id', eventId)
    .eq('minor', minor)
    .maybeSingle();

  if (error) throw error;
  return data;
}
