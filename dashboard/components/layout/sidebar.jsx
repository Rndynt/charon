'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Search, Settings, Zap, Activity, X, Menu,
} from 'lucide-react';

const navItems = [
  { href: '/overview',   label: 'Overview',    icon: LayoutDashboard },
  { href: '/positions',  label: 'Positions',   icon: TrendingUp },
  { href: '/screening',  label: 'Screening',   icon: Search },
  { href: '/strategies', label: 'Strategies',  icon: Zap },
  { href: '/settings',   label: 'Settings',    icon: Settings },
];

function NavLink({ href, label, icon: Icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13.5px',
        fontWeight: active ? '600' : '400',
        textDecoration: 'none',
        transition: 'all 0.15s',
        color: active ? '#a78bfa' : '#71717a',
        background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
        border: active ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
      }}
    >
      <Icon size={15} color={active ? '#a78bfa' : '#52525b'} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const sidebarContent = (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', borderBottom: '1px solid #2a2a38',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={15} color="#a78bfa" />
          </div>
          <div>
            <div style={{fontSize:14, fontWeight:700, color:'#f4f4f8', letterSpacing:'-0.01em'}}>Charon</div>
            <div style={{fontSize:11, color:'#52525b'}}>Solana Bot</div>
          </div>
        </div>
        {/* Mobile close */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden"
          style={{
            background:'none', border:'none', cursor:'pointer', padding:4,
            color:'#71717a', display:'flex', alignItems:'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{flex:1, padding:'8px', display:'flex', flexDirection:'column', gap:'2px'}}>
        {navItems.map(item => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            onClick={() => setOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{padding:'12px 16px', borderTop:'1px solid #2a2a38'}}>
        <div style={{fontSize:11, color:'#3f3f46', textAlign:'center'}}>v1.0.0</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 50,
          background: '#17171d', border: '1px solid #2a2a38',
          borderRadius: 8, padding: '6px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a1a1aa',
        }}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
          }}
          className="lg:hidden"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="lg:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 45,
          width: 220,
          background: '#17171d',
          borderRight: '1px solid #2a2a38',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 210, flexShrink: 0,
          flexDirection: 'column',
          background: '#17171d',
          borderRight: '1px solid #2a2a38',
          height: '100vh',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
