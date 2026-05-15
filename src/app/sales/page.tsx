'use client';
// src/app/sales/page.tsx
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { apiCall } from '@/lib/constants';

interface SaleItem { medicineName: string; qty: number; unitPrice: number; lineTotal: number; gstRate: number; }
interface Sale { id: number; invoiceNo: string; customerName: string|null; customerPhone: string|null; doctorName: string|null; discount: number; subtotal: number; cgst: number; sgst: number; grandTotal: number; createdAt: string; items: SaleItem[]; }

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number|null>(null);
  const [printSaleId, setPrintSaleId] = useState<number|null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const printFn = useReactToPrint({ content: () => printRef.current });

  useEffect(() => {
    apiCall('/api/sales').then(r => r.json()).then(d => { setSales(d); setLoading(false); }).catch(e => { console.error('Failed to load sales:', e); setLoading(false); });
  }, []);

  const fmt = (n: number) => '₹' + n.toFixed(2);
  const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const todayRevenue = sales
    .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.grandTotal, 0);

  return (
    <div style={{ padding: '28px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Sales History</h1>
          <p style={{ fontSize: 13, marginTop: 4 }}>{sales.length} total transactions · Today: ₹{todayRevenue.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}><span className="spinner" /> &nbsp;Loading…</div>
      ) : !sales.length ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          No sales recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sales.map(sale => (
            <div key={sale.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Row */}
              <div
                onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 120px 120px 36px', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', gap: 12 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>{sale.invoiceNo}</div>
                <div style={{ fontSize: 13 }}>{sale.customerName || <span style={{ color: 'var(--muted)' }}>Walk-in customer</span>}</div>
                <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{fmtDate(sale.createdAt)}</div>
                <div>
                  {sale.discount > 0
                    ? <span className="badge badge-gold">{sale.discount}% off</span>
                    : <span className="badge badge-green">No discount</span>}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{fmt(sale.grandTotal)}</div>
                <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 16, transition: 'transform 0.2s', transform: expanded === sale.id ? 'rotate(90deg)' : '' }}>›</div>
              </div>

              {/* Expanded detail */}
              {expanded === sale.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10, marginBottom: 16 }}>
                    {[
                      ['Phone', sale.customerPhone || '—'],
                      ['Doctor/Rx', sale.doctorName || '—'],
                      ['Subtotal', fmt(sale.subtotal)],
                      ['CGST', fmt(sale.cgst)],
                      ['SGST', fmt(sale.sgst)],
                      ['Discount', sale.discount > 0 ? `${sale.discount}%` : '—'],
                    ].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, fontFamily: 'var(--mono)' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Items</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Medicine','Qty','Unit Price','GST %','Total'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sale.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '7px 10px' }}>{item.medicineName}</td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--mono)' }}>{item.qty}</td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--mono)' }}>{fmt(item.unitPrice)}</td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--mono)' }}>{item.gstRate}%</td>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>{fmt(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setPrintSaleId(sale.id);
                        setTimeout(() => {
                          printFn();
                          setPrintSaleId(null);
                        }, 100);
                      }}
                    >
                      🖨 Print Bill
                    </button>
                  </div>
                  
                  <div ref={printRef} style={{ display: printSaleId === sale.id ? 'block' : 'none' }} id="receipt-printable">
                    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>PHARMACY BILL</div>
                      <div style={{ borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div>Invoice: {sale.invoiceNo}</div>
                        <div>Date: {fmtDate(sale.createdAt)}</div>
                      </div>
                      
                      <div style={{ textAlign: 'left', marginBottom: '10px' }}>
                        <div>Customer: {sale.customerName || 'Walk-in'}</div>
                        {sale.customerPhone && <div>Phone: {sale.customerPhone}</div>}
                        {sale.doctorName && <div>Doctor: {sale.doctorName}</div>}
                      </div>
                      
                      <table style={{ width: '100%', fontSize: '11px', marginBottom: '10px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px dashed #000' }}>
                            <th style={{ textAlign: 'left', padding: '5px 0' }}>Item</th>
                            <th style={{ textAlign: 'center', padding: '5px 0' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '5px 0' }}>Price</th>
                            <th style={{ textAlign: 'right', padding: '5px 0' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px dashed #ccc' }}>
                              <td style={{ textAlign: 'left', padding: '4px 0' }}>{item.medicineName}</td>
                              <td style={{ textAlign: 'center', padding: '4px 0' }}>{item.qty}</td>
                              <td style={{ textAlign: 'right', padding: '4px 0' }}>{fmt(item.unitPrice)}</td>
                              <td style={{ textAlign: 'right', padding: '4px 0' }}>{fmt(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span>Subtotal:</span>
                          <span>{fmt(sale.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span>CGST (1/2):</span>
                          <span>{fmt(sale.cgst)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span>SGST (1/2):</span>
                          <span>{fmt(sale.sgst)}</span>
                        </div>
                        {sale.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>Discount:</span>
                            <span>{sale.discount}%</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span>TOTAL:</span>
                          <span>{fmt(sale.grandTotal)}</span>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '10px', marginTop: '10px' }}>Thank you for your purchase!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
