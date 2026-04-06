import { Suspense } from 'react';
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-slate-900 rounded-xl" />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
