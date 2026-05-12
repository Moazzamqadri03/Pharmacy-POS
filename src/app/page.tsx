'use client';
// src/app/page.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 1,
    emoji: '🏥',
    title: 'Welcome to Peerzada Medicate Duroo',
    subtitle: 'Your Trusted Pharmacy Partner',
    description: 'Professional pharmacy management system designed for modern healthcare needs. License: Br-05-413/415, Sopore, District Baramulla, Kashmir. Serving community with excellence since day one.',
    cta: { text: 'Explore Dashboard', href: '#dashboard' }
  },
  {
    id: 2,
    emoji: '🛒',
    title: 'Fast & Accurate POS System',
    subtitle: 'Streamline Your Billing Process',
    description: 'Experience lightning-fast point-of-sale with real-time inventory tracking, automatic calculations, and professional receipt generation. Process transactions in seconds with our intuitive interface.',
    cta: { text: 'Start Billing', href: '/pos' }
  },
  {
    id: 3,
    emoji: '💊',
    title: 'Smart Inventory Management',
    subtitle: 'Never Run Out of Stock',
    description: 'Monitor medicine stock levels, get low-stock alerts, manage expiry dates, and maintain optimal inventory with our intelligent system. Keep track of every medicine with precision.',
    cta: { text: 'Manage Inventory', href: '/inventory' }
  },
  {
    id: 4,
    emoji: '📊',
    title: 'Comprehensive Sales Analytics',
    subtitle: 'Make Data-Driven Decisions',
    description: 'Track sales performance, analyze revenue trends, monitor profit margins, and generate detailed reports for better business insights. Understand your business better.',
    cta: { text: 'View Analytics', href: '/sales' }
  },
  {
    id: 5,
    emoji: '📋',
    title: 'Sales History & Records',
    subtitle: 'Complete Transaction Tracking',
    description: 'Access complete sales history with detailed transaction records, customer information, and payment methods. Generate comprehensive reports and audit trails for compliance.',
    cta: { text: 'View History', href: '/sales' }
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-page">
      {/* Hero Slideshow */}
      <div className="hero-slideshow">
        <div className="slideshow-container">
          {SLIDES.map((slide, index) => (
            <div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
              <div className="slide-content">
                <div className="slide-image-container">
                  <div className="slide-image-wrapper">
                    <div className="slide-image">{slide.emoji}</div>
                    <div className="slide-image-glow"></div>
                  </div>
                </div>
                <div className="slide-text">
                  <div className="slide-title">{slide.title}</div>
                  <div className="slide-subtitle">{slide.subtitle}</div>
                  <div className="slide-description">{slide.description}</div>
                  <Link href={slide.cta.href} className="btn btn-primary btn-lg">
                    {slide.cta.text}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Access Section */}
      <section className="quick-access-section">
        <div className="container">
          <div className="section-header">
            <h2>Quick Access</h2>
            <p>Jump straight into your pharmacy operations</p>
          </div>

          <div className="quick-access-grid">
            <Link href="/pos" className="quick-access-card card card-pos">
              <div className="card-visual">
                <div className="card-icon">🛒</div>
                <div className="card-icon-small">💳</div>
              </div>
              <div className="card-content">
                <h3>Point of Sale</h3>
                <p>Create new sales and generate receipts instantly with our fast POS system</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>

            <Link href="/inventory" className="quick-access-card card card-inventory">
              <div className="card-visual">
                <div className="card-icon">💊</div>
                <div className="card-icon-small">📦</div>
              </div>
              <div className="card-content">
                <h3>Inventory Management</h3>
                <p>Add medicines, track stock, and manage inventory with precision</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>

            <Link href="/sales" className="quick-access-card card card-sales">
              <div className="card-visual">
                <div className="card-icon">📋</div>
                <div className="card-icon-small">📊</div>
              </div>
              <div className="card-content">
                <h3>Sales History</h3>
                <p>Review past transactions, generate reports, and track performance</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}