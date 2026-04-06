import { Suspense } from 'react';
import EventEdit from '@/components/events/event-edit';

export default function EditEventPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-slate-900 rounded-xl" />}>
      <EventEdit />
    </Suspense>
  );
}
