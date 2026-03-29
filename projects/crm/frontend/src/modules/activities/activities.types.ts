export const ACTIVITY_TYPE = {
  llamada: 'llamada',
  reunion: 'reunion',
  tarea: 'tarea',
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const ACTIVITY_STATUS = {
  pendiente: 'pendiente',
  realizada: 'realizada',
} as const;

export type ActivityStatus = (typeof ACTIVITY_STATUS)[keyof typeof ACTIVITY_STATUS];

export interface ActivityUser {
  id: string;
  fullName: string;
  email: string;
}

export interface ActivityClient {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  clientId: string;
  opportunityId?: string | null;
  responsibleUserId: string;
  scheduledAt: string;
  dueAt?: string | null;
  status: ActivityStatus;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  responsibleUser?: ActivityUser | null;
  client?: ActivityClient | null;
}

export interface CreateActivityInput {
  type: ActivityType;
  title: string;
  clientId: string;
  opportunityId?: string;
  responsibleUserId: string;
  scheduledAt: string;
  dueAt?: string;
  status?: ActivityStatus;
  summary?: string;
}

export type UpdateActivityInput = Partial<CreateActivityInput>;
