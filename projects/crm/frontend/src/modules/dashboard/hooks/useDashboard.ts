import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  openOpportunities: number;
  pendingActivities: number;
  overdueActivities: number;
  conversionRate: number;
  recentActivities: {
    id: string;
    type: 'llamada' | 'reunion' | 'tarea';
    title: string;
    clientName: string;
    scheduledAt: string;
    status: 'pendiente' | 'realizada';
  }[];
  pipelineByStage: {
    consulta: number;
    prueba_manejo: number;
    presupuesto: number;
    cierre: number;
  };
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  stats: () => ['dashboard', 'stats'] as const,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStats }>('/dashboard/stats');
      return data.data;
    },
  });
}
