export interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  date_start: string;
  date_end: string;
  uuid_namespace: string;
  status: 'draft' | 'live' | 'ended';
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  full_name: string;
  email: string | null;
  company: string | null;
  role: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  participant_id: string;
  access_code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  beacon_id: string | null;
}

export interface Beacon {
  id: string;
  major: number;
  minor: number;
  hardware_id: string | null;
  status: 'available' | 'assigned' | 'retired';
  event_id: string | null;
}

export interface ProximityEvent {
  id: string;
  event_id: string;
  observer_id: string;
  observed_id: string;
  rssi: number | null;
  distance_m: number | null;
  detected_at: string;
  synced: boolean;
}

export interface Encounter {
  id: string;
  event_id: string;
  participant_a: string;
  participant_b: string;
  first_seen: string;
  last_seen: string;
  total_duration: string | null;
  encounter_count: number;
}

export interface DeviceToken {
  id: string;
  participant_id: string;
  platform: 'ios' | 'android' | 'web';
  token: string;
  created_at: string;
}

export interface AuthSession {
  participant: Participant;
  event: Event;
  eventParticipant: EventParticipant;
}

// Extended types for joins
export interface EventParticipantWithDetails extends EventParticipant {
  participants: Participant;
  beacons?: Beacon | null;
}
