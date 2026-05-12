'use client';
// src/app/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/lib/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  return (
    <div style={{ padding: '28px 28px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p style={{ marginTop: 4, fontSize: 13 }}>
          Peerzada Medicate Duroo &nbsp;·&nbsp; Drug License No: Br-05-413/415
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ flex: '1 1 200px', height: 110, opacity: 0.4, background: 'var(--card)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: "Today's Sales",    val: stats?.totalSalesToday   ?? 0, unit: 'bills',    icon: '🧾', color: 'var(--accent)' },
            { label: "Today's Revenue",  val: fmt(stats?.totalRevenueToday ?? 0), icon: '₹', color: 'var(--gold)' },
            { label: 'Total Medicines',  val: stats?.totalMedicines    ?? 0, unit: 'items',    icon: '💊', color: 'var(--accent2)' },
            { label: 'Low Stock Alerts', val: stats?.lowStockCount     ?? 0, unit: 'medicines',icon: '⚠️', color: 'var(--warn)' },
          ].map(({ label, val, unit, icon, color }) => (
            <div key={label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>
                {typeof val === 'number' ? val.toLocaleString('en-IN') : val}
              </div>
              {unit && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{unit}</div>}
              <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 4 }}>{label}</div>
              <div style={{
                position: 'absolute', right: -10, bottom: -10,
                fontSize: 60, opacity: 0.05,
              }}>{icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="section-label">Quick Actions</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <Link href="/pos" className="btn btn-primary btn-lg">🛒 New Sale</Link>
        <Link href="/inventory" className="btn btn-gold">+ Add Medicine</Link>
        <Link href="/sales" className="btn btn-ghost">📋 View All Sales</Link>
      </div>

      {/* Recent sales */}
      <div className="section-label">Recent Transactions</div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Invoice', 'Patient', 'Amount', 'Date/Time'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div style={{ height: 12, background: 'var(--border)', borderRadius: 4, width: j === 0 ? 90 : j === 2 ? 70 : 120 }} />
                      </td>
                    ))}
                  </tr>
                ))
              : stats?.recentSales.length
              ? stats.recentSales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>{sale.invoiceNo}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13 }}>{sale.customerName || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>{fmt(sale.grandTotal)}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--subtle)' }}>
                      {new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    No sales recorded yet. <Link href="/pos" style={{ color: 'var(--accent)' }}>Start your first sale →</Link>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
