'use client';
// src/components/Navbar.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/',           label: '🏠 Dashboard' },
  { href: '/pos',        label: '🛒 POS / Billing' },
  { href: '/inventory',  label: '💊 Inventory' },
  { href: '/sales',      label: '📋 Sales History' },
];

export default function Navbar() {
  const path = usePathname();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        '  ' +
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      background: 'linear-gradient(135deg,#0b1525 0%,#0e1f38 100%)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>💊</div>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
            Peerzada Medicate Duroo
          </div>
          <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
            Sopore, District Baramulla, Kashmir
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', gap: 4 }}>
        {NAV.map(({ href, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              color: active ? '#000' : 'var(--subtle)',
              background: active ? 'var(--accent)' : 'transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--subtle)'; }}>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{time}</div>
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: 11,
          padding: '4px 10px', borderRadius: 6, letterSpacing: '0.03em',
        }}>
          DL: Br-05-413/415
        </div>
      </div>
    </header>
  );
}
