'use client';
// src/app/inventory/page.tsx
import { useCallback, useEffect, useState } from 'react';
import Toast, { ToastMsg } from '@/components/Toast';
import { Medicine } from '@/lib/types';
import { GST_RATES } from '@/lib/constants';

const EMPTY: Omit<Medicine,'id'|'createdAt'|'updatedAt'> = { name:'', category:'', price:0, stock:0, gstRate:5 };

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const toast = (text: string, type: ToastMsg['type'] = 'success') =>
    setToasts(p => [...p, { id: Date.now(), text, type }]);

  const load = useCallback(() => {
    fetch('/api/medicines').then(r => r.json()).then(d => { setMedicines(d); setFiltered(d); });
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(medicines.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)));
  }, [search, medicines]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (m: Medicine) => { setForm({ name:m.name, category:m.category, price:m.price, stock:m.stock, gstRate:m.gstRate }); setEditId(m.id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) { toast('⚠ Name is required', 'error'); return; }
    setSaving(true);
    try {
      const url  = editId ? `/api/medicines/${editId}` : '/api/medicines';
      const meth = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method: meth, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast(editId ? '✔ Medicine updated' : '✔ Medicine added');
      load(); closeForm();
    } catch { toast('✖ Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      toast('✔ Deleted'); load();
    } catch { toast('✖ Delete failed', 'error'); }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label className="field-label">{label}</label>{children}</div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Inventory</h1>
          <p style={{ fontSize: 13, marginTop: 4 }}>{medicines.length} medicines registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Medicine</button>
      </div>

      {/* Search */}
      <input className="input" style={{ maxWidth: 400, marginBottom: 20 }} placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} />

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Medicine Name','Category','MRP (₹)','Stock','GST %','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '11px 16px', fontWeight: 600, fontSize: 13 }}>{m.name}</td>
                <td style={{ padding: '11px 16px' }}><span className="badge badge-blue">{m.category}</span></td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>₹{m.price.toFixed(2)}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 13 }}>{m.stock}</td>
                <td style={{ padding: '11px 16px', fontFamily: 'var(--mono)', fontSize: 12 }}>{m.gstRate}%</td>
                <td style={{ padding: '11px 16px' }}>
                  {m.stock === 0
                    ? <span className="badge badge-red">Out of Stock</span>
                    : m.stock <= 10
                    ? <span className="badge badge-gold">Low Stock</span>
                    : <span className="badge badge-green">In Stock</span>}
                </td>
                <td style={{ padding: '11px 16px', display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>✏ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => del(m.id, m.name)}>🗑</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No medicines found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 480, padding: 28 }}>
            <h2 style={{ marginBottom: 20 }}>{editId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Medicine Name *">
                  <input className="input" placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
                </Field>
              </div>
              <Field label="Category">
                <input className="input" placeholder="e.g. Analgesic" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} />
              </Field>
              <Field label="MRP (₹) *">
                <input className="input" type="number" min={0} step={0.01} placeholder="0.00" value={form.price || ''} onChange={e => setForm(p => ({...p, price: parseFloat(e.target.value)}))} />
              </Field>
              <Field label="Stock (units) *">
                <input className="input" type="number" min={0} placeholder="0" value={form.stock || ''} onChange={e => setForm(p => ({...p, stock: parseInt(e.target.value)}))} />
              </Field>
              <Field label="GST Rate">
                <select className="select" value={form.gstRate} onChange={e => setForm(p => ({...p, gstRate: parseInt(e.target.value)}))}>
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" style={{width:14,height:14}} /> Saving…</> : (editId ? 'Update Medicine' : 'Add Medicine')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast messages={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}
