import { supabase } from '@/lib/supabase';

export interface EventStats {
  totalParticipants: number;
  checkedIn: number;
  totalEncounters: number;
  uniquePairs: number;
  avgEncountersPerPerson: number;
}

export interface TopNetworker {
  participantId: string;
  fullName: string;
  company: string | null;
  photoUrl: string | null;
  encounterCount: number;
}

export interface HourlyData {
  hour: string;
  count: number;
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface RecentEncounter {
  id: string;
  participantAName: string;
  participantBName: string;
  firstSeen: string;
  lastSeen: string;
  encounterCount: number;
}

export async function getEventStats(eventId: string): Promise<EventStats> {
  const [participantsRes, checkedInRes, encountersRes] = await Promise.all([
    supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId),
    supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('checked_in', true),
    supabase
      .from('encounters')
      .select('id, participant_a, participant_b, encounter_count')
      .eq('event_id', eventId),
  ]);

  const totalParticipants = participantsRes.count ?? 0;
  const checkedIn = checkedInRes.count ?? 0;
  const encounters = encountersRes.data ?? [];

  const totalEncounters = encounters.reduce((sum, e) => sum + (e.encounter_count ?? 1), 0);
  const uniquePairs = encounters.length;

  // Count unique participants involved in encounters
  const participantSet = new Set<string>();
  for (const e of encounters) {
    participantSet.add(e.participant_a);
    participantSet.add(e.participant_b);
  }
  const involvedCount = participantSet.size;
  const avgEncountersPerPerson = involvedCount > 0
    ? Math.round((totalEncounters * 2 / involvedCount) * 10) / 10
    : 0;

  return {
    totalParticipants,
    checkedIn,
    totalEncounters,
    uniquePairs,
    avgEncountersPerPerson,
  };
}

export async function getTopNetworkers(
  eventId: string,
  limit: number = 10
): Promise<TopNetworker[]> {
  const { data: encounters } = await supabase
    .from('encounters')
    .select('participant_a, participant_b, encounter_count')
    .eq('event_id', eventId);

  if (!encounters || encounters.length === 0) return [];

  // Count encounters per participant
  const countMap = new Map<string, number>();
  for (const e of encounters) {
    countMap.set(e.participant_a, (countMap.get(e.participant_a) ?? 0) + (e.encounter_count ?? 1));
    countMap.set(e.participant_b, (countMap.get(e.participant_b) ?? 0) + (e.encounter_count ?? 1));
  }

  // Sort and take top N
  const sorted = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const participantIds = sorted.map(([id]) => id);

  const { data: participants } = await supabase
    .from('participants')
    .select('id, full_name, company, photo_url')
    .in('id', participantIds);

  const participantMap = new Map(
    (participants ?? []).map((p) => [p.id, p])
  );

  return sorted.map(([id, count]) => {
    const p = participantMap.get(id);
    return {
      participantId: id,
      fullName: p?.full_name ?? 'Unknown',
      company: p?.company ?? null,
      photoUrl: p?.photo_url ?? null,
      encounterCount: count,
    };
  });
}

export async function getEncountersByHour(eventId: string): Promise<HourlyData[]> {
  const { data: encounters } = await supabase
    .from('encounters')
    .select('first_seen, encounter_count')
    .eq('event_id', eventId);

  if (!encounters || encounters.length === 0) return [];

  const hourMap = new Map<string, number>();
  for (const e of encounters) {
    const hour = new Date(e.first_seen).getHours();
    const label = `${hour.toString().padStart(2, '0')}:00`;
    hourMap.set(label, (hourMap.get(label) ?? 0) + (e.encounter_count ?? 1));
  }

  return Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

export async function getEncounterTimeline(
  eventId: string,
  days: number = 7
): Promise<TimelineData[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: encounters } = await supabase
    .from('encounters')
    .select('first_seen, encounter_count')
    .eq('event_id', eventId)
    .gte('first_seen', since.toISOString());

  if (!encounters || encounters.length === 0) return [];

  const dateMap = new Map<string, number>();
  for (const e of encounters) {
    const date = new Date(e.first_seen).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) ?? 0) + (e.encounter_count ?? 1));
  }

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getRecentEncounters(
  eventId: string,
  limit: number = 10
): Promise<RecentEncounter[]> {
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, participant_a, participant_b, first_seen, last_seen, encounter_count')
    .eq('event_id', eventId)
    .order('last_seen', { ascending: false })
    .limit(limit);

  if (!encounters || encounters.length === 0) return [];

  const participantIds = new Set<string>();
  for (const e of encounters) {
    participantIds.add(e.participant_a);
    participantIds.add(e.participant_b);
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('id, full_name')
    .in('id', Array.from(participantIds));

  const nameMap = new Map(
    (participants ?? []).map((p) => [p.id, p.full_name])
  );

  return encounters.map((e) => ({
    id: e.id,
    participantAName: nameMap.get(e.participant_a) ?? 'Unknown',
    participantBName: nameMap.get(e.participant_b) ?? 'Unknown',
    firstSeen: e.first_seen,
    lastSeen: e.last_seen,
    encounterCount: e.encounter_count,
  }));
}

export async function getEncountersForExport(eventId: string) {
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, participant_a, participant_b, first_seen, last_seen, total_duration, encounter_count')
    .eq('event_id', eventId)
    .order('first_seen', { ascending: false });

  if (!encounters || encounters.length === 0) return [];

  const participantIds = new Set<string>();
  for (const e of encounters) {
    participantIds.add(e.participant_a);
    participantIds.add(e.participant_b);
  }

  const { data: participants } = await supabase
    .from('participants')
    .select('id, full_name, email, company')
    .in('id', Array.from(participantIds));

  const pMap = new Map(
    (participants ?? []).map((p) => [p.id, p])
  );

  return encounters.map((e) => {
    const a = pMap.get(e.participant_a);
    const b = pMap.get(e.participant_b);
    return {
      'Participant A': a?.full_name ?? 'Unknown',
      'Participant A Email': a?.email ?? '',
      'Participant A Company': a?.company ?? '',
      'Participant B': b?.full_name ?? 'Unknown',
      'Participant B Email': b?.email ?? '',
      'Participant B Company': b?.company ?? '',
      'First Seen': e.first_seen,
      'Last Seen': e.last_seen,
      'Duration': e.total_duration ?? '',
      'Encounter Count': e.encounter_count,
    };
  });
}
