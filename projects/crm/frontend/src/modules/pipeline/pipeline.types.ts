export const OPPORTUNITY_STAGE = {
  consulta: 'consulta',
  prueba_manejo: 'prueba_manejo',
  presupuesto: 'presupuesto',
  cierre: 'cierre',
} as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGE)[keyof typeof OPPORTUNITY_STAGE];

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  consulta: 'Consulta',
  prueba_manejo: 'Prueba de manejo',
  presupuesto: 'Presupuesto',
  cierre: 'Cierre',
};

export const OPPORTUNITY_RESULT = {
  ganado: 'ganado',
  perdido: 'perdido',
} as const;

export type OpportunityResult = (typeof OPPORTUNITY_RESULT)[keyof typeof OPPORTUNITY_RESULT];

export interface OpportunityClient {
  id: string;
  firstName: string;
  lastName: string;
  phonePrimary: string;
}

export interface OpportunityUser {
  id: string;
  fullName: string;
  email: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  assignedUserId?: string | null;
  motoInterest?: string | null;
  stage: OpportunityStage;
  result?: OpportunityResult | null;
  lossReason?: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  /** Last activity date — populated by the API via RF-11 */
  lastActivityAt?: string | null;
  client: OpportunityClient;
  assignedUser?: OpportunityUser | null;
}

export interface CreateOpportunityInput {
  clientId: string;
  assignedUserId?: string;
  motoInterest?: string;
  stage?: OpportunityStage;
}

export interface ChangeStageInput {
  stage: OpportunityStage;
  result?: OpportunityResult;
  lostReason?: string;
}

export interface OpportunitiesListResponse {
  data: Opportunity[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
