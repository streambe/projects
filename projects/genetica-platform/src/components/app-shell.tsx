"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Wallet, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/(auth)/login/actions";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const baseNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/billing", label: "Billing", icon: Wallet },
];

const adminNav: NavItem[] = [
  { href: "/admin/users", label: "Admin · Usuarios", icon: Users },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email: string; full_name: string; role: string };
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const nav = isAdmin ? [...baseNav, ...adminNav] : baseNav;
  const initials = user.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/40">
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
            G//
          </div>
          <span className="text-sm font-semibold tracking-tight">GENTICA</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-4 text-xs text-muted-foreground">
          Sprint 2 · auth + admin
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/30 px-6">
          <div className="text-sm text-muted-foreground">
            {isAdmin ? "Administrador" : "Ingeniero IA"}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-medium leading-tight">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
