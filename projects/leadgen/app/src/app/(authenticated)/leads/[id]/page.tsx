export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Lead Detail</h1>
      <p className="text-muted-foreground mt-2">Lead ID: {id}</p>
      {/* TODO: Lead detail view */}
    </div>
  );
}
