import { Suspense } from 'react';
import EventDetail from '@/components/events/event-detail';

export default function EventDetailPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-slate-900 rounded-xl" />}>
      <EventDetail />
    </Suspense>
  );
}
