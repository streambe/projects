import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './modules/auth/AuthContext';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { ClientsPage } from './modules/clients/pages/ClientsPage';
import { ClientProfilePage } from './modules/clients/pages/ClientProfilePage';
import { ActivitiesPage } from './modules/activities/pages/ActivitiesPage';
import { CommunicationsPage } from './modules/communications/pages/CommunicationsPage';
import { ReportsPage } from './modules/reports/pages/ReportsPage';
import { PipelinePage } from './modules/pipeline/pages/PipelinePage';
import { ProfilePage } from './modules/profile/pages/ProfilePage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public — login (no sidebar) */}
            <Route path="login" element={<LoginPage />} />

            {/* Protected — all app routes behind auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Redirect root to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Clients */}
                <Route path="clientes" element={<ClientsPage />} />
                <Route path="clientes/:id" element={<ClientProfilePage />} />

                {/* Pipeline — Kanban board */}
                <Route path="pipeline" element={<PipelinePage />} />

                {/* Agenda */}
                <Route path="actividades" element={<ActivitiesPage />} />

                {/* Communications */}
                <Route path="comunicaciones" element={<CommunicationsPage />} />

                {/* Reports */}
                <Route path="reportes" element={<ReportsPage />} />

                {/* Profile */}
                <Route path="perfil" element={<ProfilePage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
