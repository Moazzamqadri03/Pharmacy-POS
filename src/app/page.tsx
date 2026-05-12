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
    <div className="dashboard-shell">
      <div className="dashboard-hero card">
        <div className="dashboard-hero-copy">
          <div className="hero-badge">Live Pharmacy Pulse</div>
          <h1>Welcome to Peerzada Medicate Duroo</h1>
          <p>
            Keep your pharmacy operations smooth with clear sales insights, low-stock alerts,
            and the fastest access to billing, inventory, and sales history.
          </p>
          <div className="hero-chip-row">
            <span className="badge badge-gold">License: Br-05-413/415</span>
            <span className="badge badge-blue">Sopore, Baramulla</span>
          </div>
        </div>

        <div className="hero-status-grid">
          {[
            { label: 'Total Medicines', value: stats?.totalMedicines ?? '--', unit: 'items', color: 'var(--accent2)' },
            { label: "Today's Sales", value: stats?.totalSalesToday ?? '--', unit: 'bills', color: 'var(--accent)' },
            { label: "Today's Revenue", value: stats ? fmt(stats.totalRevenueToday) : '--', unit: 'INR', color: 'var(--gold)' },
            { label: 'Low Stock Alerts', value: stats?.lowStockCount ?? '--', unit: 'items', color: 'var(--warn)' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="hero-stat">
              <div className="hero-stat-label">{label}</div>
              <div className="hero-stat-value" style={{ color }}>
                {value}
                <span className="hero-stat-unit">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <div className="section-label">Performance Overview</div>
            <h2>Today’s insights at a glance</h2>
          </div>
          <p className="section-copy">A snapshot of revenue, sales volume, inventory health, and alerts to keep every shift on track.</p>
        </div>

        <div className="metric-grid">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="metric-card card" style={{ minHeight: 150, opacity: 0.4 }} />
            ))
          ) : (
            [
              { label: "Today's Sales",    val: stats?.totalSalesToday   ?? 0, unit: 'bills',    icon: '🧾', color: 'var(--accent)' },
              { label: "Today's Revenue",  val: fmt(stats?.totalRevenueToday ?? 0), icon: '₹', color: 'var(--gold)' },
              { label: 'Total Medicines',  val: stats?.totalMedicines    ?? 0, unit: 'items',    icon: '💊', color: 'var(--accent2)' },
              { label: 'Low Stock Alerts', val: stats?.lowStockCount     ?? 0, unit: 'medicines',icon: '⚠️', color: 'var(--warn)' },
            ].map(({ label, val, unit, icon, color }) => (
              <div key={label} className="metric-card card">
                <div className="metric-card-symbol" style={{ color }}>{icon}</div>
                <div className="metric-card-value">{typeof val === 'number' ? val.toLocaleString('en-IN') : val}</div>
                <div className="metric-card-unit">{unit}</div>
                <div className="metric-card-label">{label}</div>
                <div className="metric-card-glow" style={{ color }}>{icon}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header" style={{ alignItems: 'flex-end', gap: 18 }}>
          <div>
            <div className="section-label">Quick Actions</div>
            <h2>Move fast with every transaction</h2>
          </div>
          <p className="section-copy">Jump straight into billing, inventory management, or review sales records.</p>
        </div>

        <div className="dashboard-actions">
          <Link href="/pos" className="btn btn-primary btn-lg">🛒 New Sale</Link>
          <Link href="/inventory" className="btn btn-gold">+ Add Medicine</Link>
          <Link href="/sales" className="btn btn-ghost">📋 View Sales History</Link>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <div className="section-label">Recent Transactions</div>
            <h2>Latest invoices and customer activity</h2>
          </div>
          <p className="section-copy">Review your most recent sales, invoice totals, and service timestamps from the current day.</p>
        </div>

        <div className="card table-card">
          <table>
            <thead>
              <tr>
                {['Invoice', 'Patient', 'Amount', 'Date/Time'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((_, j) => (
                        <td key={j}>
                          <div className="loading-bar" style={{ width: j === 0 ? 90 : j === 2 ? 70 : 120 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                    : stats?.recentSales?.length
                ? stats.recentSales.map(sale => (
                    <tr key={sale.id}>
                      <td className="mono text-accent">{sale.invoiceNo}</td>
                      <td>{sale.customerName || <span className="text-muted">—</span>}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{fmt(sale.grandTotal)}</td>
                      <td className="text-subtle">{new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No sales recorded yet. <Link href="/pos" className="text-accent">Start your first sale →</Link>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
