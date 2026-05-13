'use client';
// src/app/inventory/page.tsx

import { useEffect, useState } from 'react';
import Toast, { ToastMsg } from '@/components/Toast';
import { Medicine } from '@/lib/types';
import { GST_RATES, apiCall } from '@/lib/constants';

type InventoryForm = {
  name: string;
  category: string;
  price: number;
  stock: number;
  gstRate: number;
  purchasePrice: number;
  unitsPurchased: number;
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="field-label">{label}</label>
    {children}
  </div>
);

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [form, setForm] = useState<InventoryForm>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    gstRate: 5,
    purchasePrice: 0,
    unitsPurchased: 0,
  });

  const handleFormFieldChange = <K extends keyof InventoryForm>(
    field: K,
    value: InventoryForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const toast = (
    text: string,
    type: ToastMsg['type'] = 'success'
  ) =>
    setToasts((p) => [
      ...p,
      {
        id: Date.now(),
        text,
        type,
      },
    ]);

  const safeArray = <T,>(value: unknown): T[] =>
    Array.isArray(value) ? value : [];

  const load = () => {
    apiCall('/api/medicines')
      .then((r) => r.json())
      .then((d) => {
        const list = safeArray<Medicine>(d);
        setMedicines(list);
        setFiltered(list);
      })
      .catch((error) => {
        console.error('Failed to load medicines:', error);
        toast('⚠ Failed to load medicines. Check connection.', 'error');
        setMedicines([]);
        setFiltered([]);
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    const list = safeArray<Medicine>(medicines);

    setFiltered(
      list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
    );
  }, [search, medicines]);

  const openAdd = () => {
    setForm({
      name: '',
      category: '',
      price: 0,
      stock: 0,
      gstRate: 5,
      purchasePrice: 0,
      unitsPurchased: 0,
    });

    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (m: Medicine) => {
    setForm({
      name: m.name,
      category: m.category,
      price: m.price,
      stock: m.stock,
      gstRate: m.gstRate,
      purchasePrice: m.purchasePrice || 0,
      unitsPurchased: m.unitsPurchased || 0,
    });

    setEditId(m.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast('⚠ Name is required', 'error');
      return;
    }

    setSaving(true);

    try {
      const url = editId
        ? `/api/medicines/${editId}`
        : '/api/medicines';

      const method = editId ? 'PUT' : 'POST';

      const res = await apiCall(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast(
        editId
          ? '✔ Medicine updated'
          : '✔ Medicine saved'
      );

      load();
      closeForm();
    } catch (error) {
      console.error('Save error:', error);
      toast('✖ Save failed. Check connection and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number, name: string) => {
    if (
      !confirm(
        `Delete "${name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await apiCall(`/api/medicines/${id}`, {
        method: 'DELETE',
      });

      toast('✔ Deleted');
      load();
    } catch (error) {
      console.error('Delete error:', error);
      toast('✖ Delete failed. Check connection and try again.', 'error');
    }
  };

  return (
    <div
      style={{
        padding: '28px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1>Inventory</h1>

          <p
            style={{
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {medicines.length} medicines registered
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAdd}
        >
          + Add Medicine
        </button>
      </div>

      <input
        className="input"
        style={{
          maxWidth: 400,
          marginBottom: 20,
        }}
        placeholder="Search by name or category…"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom:
                  '1px solid var(--border)',
              }}
            >
              {[
                'Medicine Name',
                'Category',
                'MRP (₹)',
                'Stock',
                'GST %',
                'Purchase Price',
                'Units Purchased',
                'Status',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontFamily: 'var(--mono)',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((m) => (
              <tr
                key={m.id}
                style={{
                  borderBottom:
                    '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
              >
                <td
                  style={{
                    padding: '11px 16px',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {m.name}
                </td>

                <td style={{ padding: '11px 16px' }}>
                  <span className="badge badge-blue">
                    {m.category}
                  </span>
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--accent)',
                  }}
                >
                  ₹{m.price.toFixed(2)}
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                  }}
                >
                  {m.stock}
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                  }}
                >
                  {m.gstRate}%
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--muted)',
                  }}
                >
                  {m.purchasePrice ? `₹${m.purchasePrice.toFixed(2)}` : '-'}
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--muted)',
                  }}
                >
                  {m.unitsPurchased || '-'}
                </td>

                <td style={{ padding: '11px 16px' }}>
                  {m.stock === 0 ? (
                    <span className="badge badge-red">
                      Out of Stock
                    </span>
                  ) : m.stock <= 10 ? (
                    <span className="badge badge-gold">
                      Low Stock
                    </span>
                  ) : (
                    <span className="badge badge-green">
                      In Stock
                    </span>
                  )}
                </td>

                <td
                  style={{
                    padding: '11px 16px',
                    display: 'flex',
                    gap: 6,
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(m)}
                  >
                    ✏ Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      del(m.id, m.name)
                    }
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  No medicines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="card"
            style={{
              width: 480,
              padding: 28,
            }}
          >
            <h2 style={{ marginBottom: 20 }}>
              {editId
                ? 'Edit Medicine'
                : 'Add New Medicine'}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 14,
              }}
            >
              <div
                style={{
                  gridColumn: '1/-1',
                }}
              >
                <Field label="Medicine Name *">
                  <input
                    className="input"
                    type="text"
                    name="name"
                    autoComplete="off"
                    placeholder="e.g. Paracetamol 500mg"
                    value={form.name}
                    onChange={(e) =>
                      handleFormFieldChange(
                        'name',
                        e.currentTarget.value
                      )
                    }
                  />
                </Field>
              </div>

              <Field label="Category">
                <input
                  className="input"
                  type="text"
                  name="category"
                  autoComplete="off"
                  placeholder="e.g. Analgesic"
                  value={form.category}
                  onChange={(e) =>
                    handleFormFieldChange(
                      'category',
                      e.currentTarget.value
                    )
                  }
                />
              </Field>

              <Field label="MRP (₹) *">
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      price: Number(
                        e.target.value
                      ),
                    }))
                  }
                />
              </Field>

              <Field label="Stock (units) *">
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      stock: Number(
                        e.target.value
                      ),
                    }))
                  }
                />
              </Field>

              <Field label="GST Rate">
                <select
                  className="select"
                  value={form.gstRate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      gstRate: Number(
                        e.target.value
                      ),
                    }))
                  }
                >
                  {GST_RATES.map((r) => (
                    <option
                      key={r}
                      value={r}
                    >
                      {r}%
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Purchase Price (₹)">
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={form.purchasePrice}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      purchasePrice: Number(
                        e.target.value
                      ),
                    }))
                  }
                />
              </Field>

              <Field label="Units Purchased">
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.unitsPurchased}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      unitsPurchased: Number(
                        e.target.value
                      ),
                    }))
                  }
                />
              </Field>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 22,
                justifyContent:
                  'flex-end',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
                title={editId ? 'Update medicine details' : 'Add new medicine'}
              >
                {saving
                  ? '⏳ Saving...'
                  : editId
                  ? '💾 Update'
                  : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        messages={toasts}
        onRemove={(id) =>
          setToasts((p) =>
            p.filter((t) => t.id !== id)
          )
        }
      />
    </div>
  );
}