"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email o contrasena invalidos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F7FF] via-white to-[#F5F7FF] opacity-60" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <Card className="rounded-[18px] border border-[rgba(0,0,0,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <CardHeader className="space-y-4 pb-2 pt-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#3957ED]">
              <span className="text-sm font-bold text-white tracking-tight">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#141414]">
                Iniciar sesion
              </h1>
              <p className="mt-1 text-sm text-[#999999]">
                Ingresa tus credenciales para continuar
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-7 pb-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-[#666666]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-10 rounded-xl border-[#E8EBFF] bg-[#F5F7FF]/50 text-sm text-[#141414] placeholder:text-[#999999] focus-visible:ring-[#3957ED] transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-[#666666]">
                  Contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 rounded-xl border-[#E8EBFF] bg-[#F5F7FF]/50 text-sm text-[#141414] placeholder:text-[#999999] focus-visible:ring-[#3957ED] transition-all duration-200"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#3957ED] text-sm font-semibold hover:bg-[#2A43D4] text-white shadow-md hover:-translate-y-px transition-all duration-200"
              >
                {loading ? "Ingresando..." : "Iniciar sesion"}
              </Button>
            </form>

            <p className="mt-6 text-center text-[11px] text-[#999999]">
              Powered by Streambe
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
