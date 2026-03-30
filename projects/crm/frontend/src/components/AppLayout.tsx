import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../modules/auth/AuthContext';
import { CommandPalette } from './CommandPalette';
import {
  IconHome,
  IconUsers,
  IconPipeline,
  IconCalendar,
  IconChat,
  IconChart,
  IconLogout,
  IconUser,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
} from './ui/Icons';

// ---------------------------------------------------------------------------
// Navigation structure
// ---------------------------------------------------------------------------

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_GROUPS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <IconHome width={18} height={18} /> },
      { to: '/clientes', label: 'Clientes', icon: <IconUsers width={18} height={18} /> },
      { to: '/pipeline', label: 'Pipeline', icon: <IconPipeline width={18} height={18} /> },
    ],
  },
  {
    section: 'Agenda',
    items: [
      { to: '/actividades', label: 'Actividades', icon: <IconCalendar width={18} height={18} /> },
    ],
  },
  {
    section: 'Canales',
    items: [
      { to: '/comunicaciones', label: 'Comunicaciones', icon: <IconChat width={18} height={18} /> },
    ],
  },
  {
    section: 'Analisis',
    items: [
      { to: '/reportes', label: 'Reportes', icon: <IconChart width={18} height={18} /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function AppLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'shrink-0 bg-brand-800 flex flex-col transition-all duration-200 shadow-sidebar',
          collapsed ? 'w-[68px]' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-400 text-white font-bold text-sm">
            CM
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-white tracking-tight">Ciudad Moto</span>
              <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                CRM
              </span>
            </div>
          )}
        </div>

        {/* Search shortcut */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <button
              type="button"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/15 transition-colors"
            >
              <IconSearch width={14} height={14} />
              <span>Buscar...</span>
              <kbd className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">Ctrl+K</kbd>
            </button>
          </div>
        )}

        {/* Nav */}
        <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.section}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  {group.section}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-white/60 hover:bg-white/10 hover:text-white/90',
                          collapsed && 'justify-center px-2',
                        )
                      }
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-center border-t border-white/10 py-2 text-white/40 hover:text-white/70 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <IconChevronRight width={16} height={16} /> : <IconChevronLeft width={16} height={16} />}
        </button>

        {/* User section */}
        <div className={cn('border-t border-white/10 p-3', collapsed && 'px-2')}>
          {user && (
            <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white uppercase">
                {user.fullName.charAt(0)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
                  <p className="truncate text-[10px] text-white/50">{user.email}</p>
                </div>
              )}
              {!collapsed && (
                <div className="flex gap-1">
                  <NavLink
                    to="/perfil"
                    className="rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors"
                    title="Configuracion"
                  >
                    <IconSettings width={14} height={14} />
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="rounded-md p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    title="Cerrar sesion"
                  >
                    <IconLogout width={14} height={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Global search command palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
