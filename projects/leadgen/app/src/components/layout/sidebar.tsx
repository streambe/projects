"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  Zap,
  FileText,
  Upload,
  CalendarClock,
  Search,
  Send,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/sequences", label: "Sequences", icon: Zap },
  { href: "/actions", label: "Actions", icon: CalendarClock },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/linkedin", label: "Buscar LinkedIn", icon: Search },
  { href: "/import", label: "Import", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 flex-col bg-white border-r border-[rgba(0,0,0,0.05)]">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3957ED]">
            <span className="text-xs font-bold text-white tracking-tight">L</span>
          </div>
          <span className="text-[15px] font-bold text-[#141414] tracking-tight">LeadGen</span>
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px bg-[rgba(0,0,0,0.05)]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#999999]">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-[#F5F7FF] text-[#3957ED]"
                  : "text-[#666666] hover:bg-[#F5F7FF]/60 hover:text-[#3957ED]"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-[#3957ED]" : "text-[#999999]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-4 h-px bg-[rgba(0,0,0,0.05)]" />

      {/* User section */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-[#F5F7FF] focus:outline-none">
            <Avatar className="h-7 w-7 border border-[#E8EBFF]">
              <AvatarFallback className="bg-[#F5F7FF] text-[11px] font-semibold text-[#3957ED]">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-medium text-[#141414] truncate">Usuario</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#999999]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 rounded-xl">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
