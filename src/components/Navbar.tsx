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
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      minHeight: '64px',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      padding: '12px 24px',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, minWidth: 0, maxWidth: 360, flex: '1 1 240px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>💊</div>
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Peerzada Medicate Duroo
          </div>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)', letterSpacing: '0.05em', whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3 }}>
            Sopore, District Baramulla, Kashmir
          </div>
        </div>
      </div>

      <button type="button" className="nav-toggle" onClick={toggleMenu} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Nav Links */}
      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
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
              whiteSpace: 'nowrap',
            }}
            onClick={closeMenu}
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
