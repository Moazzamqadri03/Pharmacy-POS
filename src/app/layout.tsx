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
        <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      <footer style={{textAlign: 'center', padding: '10px', opacity: 0.5, fontSize: '12px'}}>
  © 2025 Moazzam Qadri. All rights reserved.
</footer>
</body>
    </html>
  );
}
