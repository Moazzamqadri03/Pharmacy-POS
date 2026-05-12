'use client';
// src/components/Receipt.tsx
import { forwardRef } from 'react';
import { CartItem } from '@/lib/types';
import { STORE } from '@/lib/constants';

interface Props {
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  doctorName: string;
  cart: CartItem[];
  discount: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  date: string;
  gstin: string;
}

const Receipt = forwardRef<HTMLDivElement, Props>(function Receipt(
  { invoiceNo, customerName, customerPhone, doctorName, cart, discount, subtotal, cgst, sgst, grandTotal, date, gstin },
  ref
) {
  const discAmt = subtotal * discount / 100;

  return (
    <div ref={ref} id="receipt-printable" style={{
      background: '#fff', color: '#111',
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 12, lineHeight: 1.55,
      width: '100%', maxWidth: 360,
      padding: '20px 18px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 19, fontWeight: 900, fontFamily: 'Georgia,serif', lineHeight: 1.2 }}>
          {STORE.name}
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{STORE.address}</div>
        {/* ── LICENSE — required on every receipt ── */}
        <div style={{
          display: 'inline-block', margin: '6px 0',
          fontSize: 12, fontWeight: 700, color: '#92400e',
          background: '#fef3c7', border: '1.5px solid #f59e0b',
          borderRadius: 4, padding: '3px 14px', letterSpacing: '0.04em',
        }}>
          {STORE.licenseLabel}
        </div>
        <div style={{ fontSize: 10, color: '#777', marginTop: 2 }}>GSTIN: {gstin}</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #aaa', margin: '8px 0' }} />

      {/* Meta */}
      {[
        ['Invoice No:', invoiceNo],
        ['Date & Time:', date],
        ['Patient:', customerName || '—'],
        ['Phone:', customerPhone || '—'],
        ['Doctor / Rx:', doctorName || '—'],
      ].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '1px 0', color: '#444' }}>
          <span>{k}</span><strong style={{ color: '#111' }}>{v}</strong>
        </div>
      ))}

      <hr style={{ border: 'none', borderTop: '2px solid #333', margin: '8px 0' }} />

      {/* Items header */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontWeight: 700, fontSize: 11, borderBottom: '1px solid #bbb', paddingBottom: 4, marginBottom: 4 }}>
        <span>Medicine</span><span style={{ textAlign: 'center' }}>Qty</span>
        <span style={{ textAlign: 'right' }}>MRP</span><span style={{ textAlign: 'right' }}>Total</span>
      </div>

      {/* Items */}
      {cart.map((item, i) => {
        const lineAmt = item.price * item.qty * (1 - discount / 100);
        return (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontSize: 11.5, padding: '2px 0', background: i % 2 === 0 ? 'transparent' : '#f9f9f9' }}>
            <span>{item.name}</span>
            <span style={{ textAlign: 'center' }}>{item.qty}</span>
            <span style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</span>
            <span style={{ textAlign: 'right' }}>₹{lineAmt.toFixed(2)}</span>
          </div>
        );
      })}

      <hr style={{ border: 'none', borderTop: '1px dashed #aaa', margin: '8px 0' }} />

      {/* Totals */}
      {[
        ['Subtotal (MRP)', `₹${subtotal.toFixed(2)}`, false],
        ...(discount > 0 ? [[`Discount (${discount}%)`, `− ₹${discAmt.toFixed(2)}`, false]] : []),
        ['CGST (incl. in MRP)', `₹${cgst.toFixed(2)}`, false],
        ['SGST (incl. in MRP)', `₹${sgst.toFixed(2)}`, false],
      ].map(([k, v]) => (
        <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '1px 0', color: '#555' }}>
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, borderTop: '2px solid #333', marginTop: 6, paddingTop: 6 }}>
        <span>TOTAL</span><span>₹{grandTotal.toFixed(2)}</span>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #aaa', margin: '10px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 10, color: '#666', lineHeight: 1.7 }}>
        <div>* All prices are MRP inclusive of GST (CGST + SGST) *</div>
        <div>Goods once sold are not returnable without prescription</div>
        <div style={{ marginTop: 6, fontWeight: 700, fontSize: 11, color: '#333' }}>
          Thank you for choosing {STORE.name}
        </div>
        <div style={{ marginTop: 3, fontWeight: 700, color: '#92400e', fontSize: 11 }}>
          {STORE.licenseLabel}
        </div>
        <div style={{ fontSize: 10, color: '#888' }}>{STORE.address}</div>
      </div>
    </div>
  );
});

export default Receipt;
