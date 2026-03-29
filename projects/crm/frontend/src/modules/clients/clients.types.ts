export const HOW_FOUND_US = {
  instagram: 'instagram',
  facebook: 'facebook',
  google: 'google',
  referido: 'referido',
  visita_directa: 'visita_directa',
  otro: 'otro',
} as const;

export type HowFoundUs = (typeof HOW_FOUND_US)[keyof typeof HOW_FOUND_US];

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phonePrimary: string;
  phoneAlt?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
  city?: string | null;
  province?: string | null;
  birthDate?: string | null;
  howFoundUs?: HowFoundUs | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  dni: string;
  phonePrimary: string;
  phoneAlt?: string;
  email?: string;
  whatsappNumber?: string;
  city?: string;
  province?: string;
  birthDate?: string;
  howFoundUs?: HowFoundUs;
  notes?: string;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface DuplicateConflict {
  id: string;
  fullName: string;
  field: 'dni' | 'phonePrimary';
}

export interface CreateClientResponse {
  data: {
    client: Client | null;
    conflict: DuplicateConflict | null;
  };
}

export interface ClientsListResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface DuplicateCheckResponse {
  data: {
    conflict: DuplicateConflict | null;
  };
}
