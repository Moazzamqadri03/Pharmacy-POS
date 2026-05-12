// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Peerzada Medicate Duroo — POS',
  description: 'Pharmacy Management & Billing System | Drug License No: Br-05-413/415',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-shell">
          {children}
        </main>
        <footer className="app-footer">© 2026 Moazzam Hussain Qadri. All rights reserved.</footer>
      </body>
    </html>
  );
}
