import type { HowFoundUs } from '../clients/clients.types';

export interface NewClientsReportRow {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  howFoundUs?: HowFoundUs | null;
}

export interface NewClientsReportResponse {
  data: {
    total: number;
    rows: NewClientsReportRow[];
  };
}

export interface ActivitiesByUserRow {
  userId: string;
  userName: string;
  total: number;
  byType: {
    llamada: number;
    reunion: number;
    tarea: number;
  };
}

export interface ActivitiesByUserReportResponse {
  data: {
    rows: ActivitiesByUserRow[];
  };
}
