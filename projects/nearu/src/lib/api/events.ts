import { supabase } from '@/lib/supabase';
import type { Event, EventParticipant } from '@/lib/types';

export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getEventParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      participants (*),
      beacons:beacon_id (*)
    `)
    .eq('event_id', eventId);

  if (error) throw error;
  return data ?? [];
}

export async function getLiveEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'live')
    .order('date_start', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createEventParticipant(
  eventId: string,
  participantId: string
): Promise<EventParticipant> {
  const accessCode = generateAccessCode();

  const { data, error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      participant_id: participantId,
      access_code: accessCode,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function checkInParticipant(
  eventParticipantId: string,
  beaconId: string
): Promise<void> {
  const { error } = await supabase
    .from('event_participants')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      beacon_id: beaconId,
    })
    .eq('id', eventParticipantId);

  if (error) throw error;
}

export async function searchEventParticipants(
  eventId: string,
  query: string
) {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      participants!inner (*)
    `)
    .eq('event_id', eventId)
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`, { referencedTable: 'participants' });

  if (error) throw error;
  return data ?? [];
}
