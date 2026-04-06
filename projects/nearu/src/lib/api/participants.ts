import { supabase } from '@/lib/supabase';
import type { Participant, EventParticipant, Event, AuthSession } from '@/lib/types';

export async function getParticipantByEmail(
  email: string
): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateParticipant(
  id: string,
  updates: Partial<Pick<Participant, 'full_name' | 'company' | 'role' | 'photo_url'>>
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getParticipantByAccessCode(
  code: string
): Promise<AuthSession | null> {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      participants (*),
      events (*)
    `)
    .eq('access_code', code.toUpperCase().trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const eventParticipant: EventParticipant = {
    id: data.id,
    event_id: data.event_id,
    participant_id: data.participant_id,
    access_code: data.access_code,
    checked_in: data.checked_in,
    checked_in_at: data.checked_in_at,
    beacon_id: data.beacon_id,
  };

  return {
    participant: data.participants as unknown as Participant,
    event: data.events as unknown as Event,
    eventParticipant,
  };
}

export async function createParticipant(
  participant: { full_name: string; email?: string; company?: string; role?: string }
): Promise<Participant> {
  const { data, error } = await supabase
    .from('participants')
    .insert(participant)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function bulkCreateParticipants(
  eventId: string,
  participants: { full_name: string; email?: string; company?: string; role?: string }[]
): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  for (const p of participants) {
    try {
      // Check if participant with this email already exists
      let participant: Participant | null = null;
      if (p.email) {
        participant = await getParticipantByEmail(p.email);
      }

      if (!participant) {
        participant = await createParticipant(p);
      }

      // Check if already registered for this event
      const { data: existing } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('participant_id', participant.id)
        .maybeSingle();

      if (!existing) {
        const { error: epError } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            participant_id: participant.id,
            access_code: generateAccessCode(),
          });

        if (epError) throw epError;
        created++;
      }
    } catch (err) {
      errors.push(`${p.full_name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { created, errors };
}
