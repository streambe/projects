import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, email } = await requireUser();
  return (
    <AppShell
      user={{
        email,
        full_name: profile.full_name,
        role: profile.role,
      }}
    >
      {children}
    </AppShell>
  );
}
