import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOptionalUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getOptionalUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-helix-500/30 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-mono text-2xl font-bold tracking-tight text-primary">
            G//
          </div>
          <CardTitle className="text-2xl">GENTICA Platform</CardTitle>
          <CardDescription>
            Iniciá sesión para hablar con tu equipo GEN
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <LoginForm />
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            Acceso restringido al equipo de ingeniería IA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
