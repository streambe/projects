import Sidebar from '@/components/backoffice/sidebar';

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
