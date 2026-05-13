'use client';
// src/app/pos/page.tsx
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from '@/components/Receipt';
import Toast, { ToastMsg } from '@/components/Toast';
import { CartItem, Medicine } from '@/lib/types';
import { apiCall } from '@/lib/constants';

let _inv = 1000;
function nextInv() {
  if (typeof window !== 'undefined') {
    const stored = parseInt(localStorage.getItem('pmd_inv') || '1000');
    _inv = stored + 1;
    localStorage.setItem('pmd_inv', String(_inv));
    return 'PMD-' + String(_inv).padStart(5, '0');
  }
  return 'PMD-' + String(++_inv).padStart(5, '0');
}

export default function POSPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [saving, setSaving] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDate, setReceiptDate] = useState('');

  const receiptRef = useRef<HTMLDivElement>(null);
  const printFn = useReactToPrint({ content: () => receiptRef.current });

  const toast = (text: string, type: ToastMsg['type'] = 'success') =>
    setToasts(p => [...p, { id: Date.now(), text, type }]);

  const safeArray = <T,>(value: unknown): T[] =>
    Array.isArray(value) ? value : [];

  useEffect(() => {
    setInvoiceNo(nextInv());
    apiCall('/api/medicines')
      .then((r) => r.json())
      .then((data) => {
        const list = safeArray<Medicine>(data);
        setMedicines(list);
        setFiltered(list);
      })
      .catch((error) => {
        console.error('Failed to load medicines:', error);
        toast('⚠ Failed to load medicines. Check connection.', 'error');
        setMedicines([]);
        setFiltered([]);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const list = safeArray<Medicine>(medicines);
    setFiltered(list.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)));
  }, [search, medicines]);

  const addToCart = (med: Medicine) => {
    if (med.stock <= 0) { toast('⚠ Out of stock', 'error'); return; }
    setCart(prev => {
      const ex = prev.find(c => c.id === med.id);
      if (ex) {
        if (ex.qty >= med.stock) { toast('⚠ Insufficient stock', 'error'); return prev; }
        return prev.map(c => c.id === med.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: med.id, name: med.name, price: med.price, qty: 1, gstRate: med.gstRate }];
    });
    toast(`+ ${med.name}`);
  };

  const changeQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  };

  const removeFromCart = (id: number) => setCart(p => p.filter(c => c.id !== id));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = subtotal * discount / 100;
  const afterDisc = subtotal - discAmt;
  let totalGst = 0;
  cart.forEach(i => { totalGst += (i.price * i.qty * (1 - discount / 100)) * i.gstRate / (100 + i.gstRate); });
  const cgst = totalGst / 2, sgst = totalGst / 2;
  const grandTotal = afterDisc;

  const handlePrint = async () => {
    if (!cart.length) { toast('⚠ Cart is empty', 'error'); return; }
    if (!custName.trim()) { toast('⚠ Patient name is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        invoiceNo, customerName: custName, customerPhone: custPhone, doctorName,
        discount, subtotal, cgst, sgst, grandTotal,
        items: cart.map(i => ({
          medicineId: i.id, medicineName: i.name, qty: i.qty,
          unitPrice: i.price, gstRate: i.gstRate,
          lineTotal: i.price * i.qty * (1 - discount / 100),
        })),
      };
      const res = await apiCall('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      setReceiptDate(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
      setShowReceipt(true);
      toast('✔ Sale saved successfully');
      const updated = await apiCall('/api/medicines').then((r) => r.json());
      const updatedList = safeArray<Medicine>(updated);
      setMedicines(updatedList);
      setFiltered(updatedList.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())));
    } catch (e) {
      console.error('Sale error:', e);
      toast('✖ Failed to save sale. Check connection and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const newSale = () => {
    setCart([]); setCustName(''); setCustPhone(''); setDoctorName('');
    setDiscount(0); setShowReceipt(false); setInvoiceNo(nextInv());
  };

  const fmt = (n: number) => '₹' + n.toFixed(2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* LEFT: INVENTORY */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
          <input
            className="input"
            placeholder="Search medicine by name or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '100%' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div className="section-label">Medicines — {filtered.length} items</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
            {filtered.map(med => (
              <div key={med.id}
                onClick={() => addToCart(med)}
                style={{
                  background: 'var(--card)', border: `1px solid ${med.stock <= 10 ? 'rgba(239,68,68,0.35)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,200,150,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = med.stock <= 10 ? 'rgba(239,68,68,0.35)' : 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{med.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{med.category}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)', marginTop: 6 }}>{fmt(med.price)}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: med.stock <= 10 ? 'var(--warn)' : '#22c55e', marginTop: 2 }}>
                  {med.stock <= 10 ? '⚠ ' : ''}Stock: {med.stock} · GST {med.gstRate}%
                </div>
              </div>
            ))}
            {!filtered.length && <div style={{ color: 'var(--muted)', fontSize: 13, gridColumn: '1/-1', padding: '24px 0' }}>No medicines found.</div>}
          </div>
        </div>
      </div>

      {/* RIGHT: CART */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--navy)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--serif)' }}>Current Sale</h2>
          <span className="badge badge-green">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Customer fields - FIXED */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label className="field-label">Patient Name *</label>
            <input
              className="input"
              style={{ padding: '7px 10px', fontSize: 13 }}
              placeholder="Enter patient name"
              value={custName}
              onChange={e => setCustName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Phone No.</label>
            <input
              className="input"
              style={{ padding: '7px 10px', fontSize: 13 }}
              placeholder="Optional"
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Doctor / Rx</label>
            <input
              className="input"
              style={{ padding: '7px 10px', fontSize: 13 }}
              placeholder="Dr. name or Rx No."
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Invoice No.</label>
            <input className="input mono text-accent" style={{ padding: '7px 10px', fontSize: 13 }} value={invoiceNo} readOnly />
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
          {!cart.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: 'var(--muted)' }}>
              <div style={{ fontSize: 42, opacity: 0.25 }}>🛒</div>
              <div style={{ fontSize: 13, fontStyle: 'italic' }}>No items added yet</div>
              <div style={{ fontSize: 11 }}>Click a medicine card to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                  {fmt(item.price)} × {item.qty} · GST {item.gstRate}%
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {(['−', 'qty', '+', '✕'] as const).map((ctrl) => (
                    ctrl === 'qty'
                      ? <span key="qty" style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, minWidth: 22, textAlign: 'center' }}>{item.qty}</span>
                      : <button key={ctrl} onClick={() => ctrl === '✕' ? removeFromCart(item.id) : changeQty(item.id, ctrl === '+' ? 1 : -1)}
                          style={{ width: 24, height: 24, borderRadius: 5, border: 'none', cursor: 'pointer',
                            background: ctrl === '✕' ? 'transparent' : 'var(--border)',
                            color: ctrl === '✕' ? 'var(--muted)' : 'var(--text)', fontSize: 13,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = ctrl === '✕' ? 'transparent' : 'var(--accent)', e.currentTarget.style.color = ctrl === '✕' ? 'var(--warn)' : '#000')}
                          onMouseLeave={e => (e.currentTarget.style.background = ctrl === '✕' ? 'transparent' : 'var(--border)', e.currentTarget.style.color = ctrl === '✕' ? 'var(--muted)' : 'var(--text)')}>
                          {ctrl}
                        </button>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  {fmt(item.price * item.qty)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Discount (%)</label>
            <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="input mono" style={{ width: 80, padding: '5px 8px', textAlign: 'center', color: 'var(--accent)' }} />
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>−{fmt(discAmt)}</span>
          </div>
          {[['Subtotal', fmt(subtotal)], ['CGST (incl.)', fmt(cgst)], ['SGST (incl.)', fmt(sgst)]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '3px 0' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Grand Total</span>
            <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{fmt(grandTotal)}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '0 20px 8px' }}>
          * GST split as CGST + SGST (intra-state). MRP prices are tax-inclusive.
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-danger" onClick={() => { setCart([]); setDiscount(0); }}>🗑 Clear Cart</button>
          <button className="btn btn-secondary" onClick={newSale}>+ New Sale</button>
          <button className="btn btn-primary btn-lg" style={{ gridColumn: '1/-1', fontSize: 14 }} onClick={handlePrint} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : '🖨 Save & Print Receipt'}
          </button>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {showReceipt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <div style={{ maxHeight: '80vh', overflowY: 'auto', borderRadius: 6, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <Receipt ref={receiptRef}
              invoiceNo={invoiceNo} customerName={custName} customerPhone={custPhone} doctorName={doctorName}
              cart={cart} discount={discount} subtotal={subtotal} cgst={cgst} sgst={sgst} grandTotal={grandTotal}
              date={receiptDate} gstin={process.env.NEXT_PUBLIC_GSTIN || '01XXXXX0000X1ZX'} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { if (printFn) printFn(); }} title="Print receipt">🖨 Print Receipt</button>
            <button className="btn btn-gold" onClick={newSale} title="Start new sale">+ New Sale</button>
            <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>✕ Close</button>
          </div>
        </div>
      )}

      <Toast messages={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}