import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Search,
  GitCompareArrows,
  Star,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import { classNames } from '@/utils/formatters';
import { APP_NAME } from '@/config/constants';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/carteira', label: 'Carteira', icon: Wallet },
  { to: '/buscar', label: 'Buscar', icon: Search },
  { to: '/comparar', label: 'Comparador', icon: GitCompareArrows },
  { to: '/favoritos', label: 'Favoritos', icon: Star },
  { to: '/relatorio', label: 'Resumo de Relatório', icon: FileText },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={classNames(
        'flex flex-col shrink-0 border-r border-base-600 bg-base-900 transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-base-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400 shrink-0">
          <Building2 size={18} />
        </div>
        {!collapsed && <span className="font-display font-semibold text-ink-100 tracking-tight truncate">{APP_NAME}</span>}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-signal-500/12 text-signal-400' : 'text-ink-500 hover:bg-base-700 hover:text-ink-100'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-4 h-12 border-t border-base-600 text-ink-500 hover:text-ink-100 text-sm transition-colors"
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        {!collapsed && 'Recolher'}
      </button>
    </aside>
  );
}
