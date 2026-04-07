import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin · Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Gestionar el equipo de ingeniería IA. Solo accesible para administradores.
        </p>
      </div>
      <UsersTable initialUsers={data ?? []} />
    </div>
  );
}
