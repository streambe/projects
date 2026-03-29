import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';

// ---------------------------------------------------------------------------
// Navigation structure
// ---------------------------------------------------------------------------

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Principal',
    items: [
      { to: '/clientes', label: 'Clientes', icon: '👥' },
      { to: '/pipeline', label: 'Pipeline', icon: '📊' },
    ],
  },
  {
    section: 'Agenda',
    items: [
      { to: '/actividades', label: 'Actividades', icon: '📋' },
    ],
  },
  {
    section: 'Canales',
    items: [
      { to: '/comunicaciones', label: 'Comunicaciones', icon: '💬' },
    ],
  },
  {
    section: 'Análisis',
    items: [
      { to: '/reportes', label: 'Reportes', icon: '📈' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="border-b border-gray-200 px-5 py-4">
          <span className="text-base font-bold tracking-tight text-gray-900">
            Ciudad Moto
          </span>
          <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
            CRM
          </span>
        </div>

        {/* Nav */}
        <nav aria-label="Menú principal" className="flex-1 overflow-y-auto p-3 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.section}>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )
                      }
                    >
                      <span role="img" aria-hidden="true" className="text-base leading-none">
                        {item.icon}
                      </span>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
