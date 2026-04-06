'use client';

import { supabase } from '@/lib/supabase';
import type { Encounter, Participant } from '@/lib/types';

export interface EncounterWithParticipant extends Encounter {
  otherParticipant: Participant;
}

/**
 * Fetch all encounters for a participant in an event,
 * joining with the OTHER person's participant record.
 */
export async function getParticipantEncounters(
  eventId: string,
  participantId: string,
): Promise<EncounterWithParticipant[]> {
  // Fetch encounters where participant is either A or B
  const { data, error } = await supabase
    .from('encounters')
    .select('*')
    .eq('event_id', eventId)
    .or(`participant_a.eq.${participantId},participant_b.eq.${participantId}`)
    .order('last_seen', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Collect the IDs of the OTHER participants
  const otherIds = data.map((e: Encounter) =>
    e.participant_a === participantId ? e.participant_b : e.participant_a,
  );

  const uniqueIds = [...new Set(otherIds)];

  const { data: participants, error: pError } = await supabase
    .from('participants')
    .select('*')
    .in('id', uniqueIds);

  if (pError) throw pError;

  const participantMap = new Map<string, Participant>();
  for (const p of participants ?? []) {
    participantMap.set(p.id, p as Participant);
  }

  return data.map((enc: Encounter) => {
    const otherId =
      enc.participant_a === participantId
        ? enc.participant_b
        : enc.participant_a;
    return {
      ...enc,
      otherParticipant: participantMap.get(otherId) ?? {
        id: otherId,
        full_name: 'Unknown',
        email: null,
        company: null,
        role: null,
        photo_url: null,
        created_at: '',
      },
    };
  });
}

/**
 * Create or update an encounter between two participants.
 * Always stores participant_a_id < participant_b_id (sorted by UUID string).
 */
export async function createOrUpdateEncounter(
  eventId: string,
  participantAId: string,
  participantBId: string,
  distance: number,
): Promise<void> {
  // Sort IDs so participant_a < participant_b
  const [sortedA, sortedB] =
    participantAId < participantBId
      ? [participantAId, participantBId]
      : [participantBId, participantAId];

  const now = new Date().toISOString();

  // Check if encounter exists
  const { data: existing, error: fetchError } = await supabase
    .from('encounters')
    .select('*')
    .eq('event_id', eventId)
    .eq('participant_a', sortedA)
    .eq('participant_b', sortedB)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    // Update existing encounter
    const firstSeen = new Date(existing.first_seen).getTime();
    const durationMs = Date.now() - firstSeen;
    const durationInterval = `${Math.floor(durationMs / 1000)} seconds`;

    const { error: updateError } = await supabase
      .from('encounters')
      .update({
        last_seen: now,
        total_duration: durationInterval,
        encounter_count: (existing.encounter_count ?? 1) + 1,
      })
      .eq('id', existing.id);

    if (updateError) throw updateError;
  } else {
    // Create new encounter
    const { error: insertError } = await supabase
      .from('encounters')
      .insert({
        event_id: eventId,
        participant_a: sortedA,
        participant_b: sortedB,
        first_seen: now,
        last_seen: now,
        total_duration: '0 seconds',
        encounter_count: 1,
      });

    if (insertError) throw insertError;
  }
}
