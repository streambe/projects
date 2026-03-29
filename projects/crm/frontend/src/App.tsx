import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import { AppLayout } from './components/AppLayout';
import { ClientsPage } from './modules/clients/pages/ClientsPage';
import { ClientProfilePage } from './modules/clients/pages/ClientProfilePage';
import { ActivitiesPage } from './modules/activities/pages/ActivitiesPage';
import { CommunicationsPage } from './modules/communications/pages/CommunicationsPage';
import { ReportsPage } from './modules/reports/pages/ReportsPage';
import { PipelinePage } from './modules/pipeline/pages/PipelinePage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Redirect root to clients */}
            <Route index element={<Navigate to="/clientes" replace />} />

            {/* Clients */}
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/:id" element={<ClientProfilePage />} />

            {/* Pipeline — Kanban board (RF-11) */}
            <Route path="pipeline" element={<PipelinePage />} />

            {/* Agenda */}
            <Route path="actividades" element={<ActivitiesPage />} />

            {/* Communications */}
            <Route path="comunicaciones" element={<CommunicationsPage />} />

            {/* Reports */}
            <Route path="reportes" element={<ReportsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/clientes" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
