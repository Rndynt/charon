'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  Settings,
  Zap,
  Activity,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/positions', label: 'Positions', icon: TrendingUp },
  { href: '/screening', label: 'Screening', icon: Search },
  { href: '/strategies', label: 'Strategies', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-52 flex-col border-r border-surface-border bg-[#0b0b12]">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600/20 border border-violet-600/30">
          <Activity className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Charon</p>
          <p className="text-xs text-slate-600">Solana Bot</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all group',
                active
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-600/20'
                  : 'text-slate-500 hover:bg-surface-hover hover:text-slate-300'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400')} />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto h-3 w-3 text-violet-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-border">
        <p className="text-xs text-slate-700 text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
