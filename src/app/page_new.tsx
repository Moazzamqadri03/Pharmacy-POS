'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type SaleRow = {
  id: string;
  invoiceNo: string;
  customerName: string;
  grandTotal: number;
  createdAt: string;
};

type DashboardMetrics = {
  totalSalesToday: number;
  totalRevenueToday: number;
  totalMedicines: number;
  lowStockCount: number;
  recentSales: SaleRow[];
};

const HERO_IMAGES = [
  { src: '/images/dashboard-hero-1.svg', alt: 'Pharmacy analytics illustration', label: 'Inventory + compliance' },
  { src: '/images/dashboard-hero-2.svg', alt: 'Sales performance illustration', label: 'Revenue momentum' },
  { src: '/images/dashboard-hero-3.svg', alt: 'Medicine product illustration', label: 'Stock clarity' },
  { src: '/images/dashboard-hero-4.svg', alt: 'Brand and team illustration', label: 'Trusted care experience' },
];

const FEATURE_CARDS = [
  {
    title: 'Curated product galleries',
    description: 'Visual cards for medicines, stock status, and expiry with crisp imagery and clear signals.',
    icon: '🧪',
    href: '/inventory',
  },
  {
    title: 'Action-ready analytics',
    description: 'High-impact charts, quick actions, and compelling visuals for every pharmacy owner.',
    icon: '📊',
    href: '/sales',
  },
  {
    title: 'Premium billing workflow',
    description: 'Make POS feel polished with a clean interface, powerful search, and responsive visuals.',
    icon: '💳',
    href: '/pos',
  },
  {
    title: 'Fast stock alerts',
    description: 'See low inventory instantly with bright badges, product imagery, and fast review links.',
    icon: '⚠️',
    href: '/inventory',
  },
];

export default function HomePage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Dashboard fetch failed', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="hero-badge">Premium dashboard</span>
          <h1>Attract attention with a beautifully image-rich pharmacy dashboard.</h1>
          <p>
            Combine elegant visual storytelling with fast operations. See revenue, stock status, and product performance in one stunning control center.
          </p>
          <div className="dashboard-actions">
            <Link href="/pos" className="btn btn-primary btn-lg">
              Open POS
            </Link>
            <Link href="/inventory" className="btn btn-secondary">
              Inventory board
            </Link>
          </div>

          <div className="hero-status-grid">
            <div className="hero-stat">
              <div className="hero-stat-label">Sales today</div>
              <div className="hero-stat-value">
                {loading ? '—' : metrics?.totalSalesToday ?? 0}
                <span className="hero-stat-unit">transactions</span>
              </div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-label">Revenue today</div>
              <div className="hero-stat-value">
                {loading ? '—' : formatCurrency(metrics?.totalRevenueToday ?? 0)}
                <span className="hero-stat-unit">net value</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-hero-visual">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={image.src}
              className={`hero-image-card ${index === activeImage ? 'active' : ''}`}
              onMouseEnter={() => setActiveImage(index)}
            >
              <div className="image-frame">
                <Image src={image.src} alt={image.alt} width={520} height={360} className="hero-image" />
              </div>
              <div className="image-label">{image.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Image-led product stories</h2>
            <p className="section-copy">
              Create a dashboard that feels vibrant and professional with visual cards, vivid icons, and smart callouts.
            </p>
          </div>
        </div>

        <div className="feature-gallery">
          {FEATURE_CARDS.map((feature) => (
            <article key={feature.title} className="feature-card card">
              <div className="feature-card-icon">{feature.icon}</div>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <Link href={feature.href} className="btn btn-ghost btn-sm">
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent sales highlights</h2>
            <p className="section-copy">
              Review the latest transactions at a glance and keep the dashboard bursting with meaningful imagery and data.
            </p>
          </div>
        </div>

        <div className="table-card card">
          {loading ? (
            <div className="empty-state">Loading analytics…</div>
          ) : metrics?.recentSales?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.invoiceNo}</td>
                    <td>{sale.customerName}</td>
                    <td>{formatCurrency(sale.grandTotal)}</td>
                    <td>{formatDate(sale.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No recent sales recorded yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
