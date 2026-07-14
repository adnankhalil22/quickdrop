import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';

const emptyForm = { menu_category_id: '', name: '', description: '', price: '', is_available: true };

export default function ManagerMenuItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);

  function loadData() {
    setStatus('loading');
    Promise.all([client.get('/manager/menu-items'), client.get('/manager/categories')])
      .then(([itemsResponse, categoriesResponse]) => {
        setItems(itemsResponse.data.menu_items);
        setCategories(categoriesResponse.data.categories);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadData, []);

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name || 'Uncategorized';
  }

  function startCreate() {
    setEditing(null);
    setForm({ ...emptyForm, menu_category_id: categories[0]?.id || '' });
    setFormErrors({});
    setActionError('');
    setMode('create');
  }

  function startEdit(item) {
    setEditing(item);
    setForm({
      menu_category_id: item.menu_category_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      is_available: item.is_available,
    });
    setFormErrors({});
    setActionError('');
    setMode('edit');
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      if (mode === 'edit') {
        await client.put(`/manager/menu-items/${editing.id}`, form);
      } else {
        await client.post('/manager/menu-items', form);
      }
      setMode('list');
      loadData();
    } catch (err) {
      setFormErrors(getValidationErrors(err));
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await client.delete(`/manager/menu-items/${item.id}`);
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function toggleAvailability(item) {
    setBusyItemId(item.id);
    try {
      await client.put(`/manager/menu-items/${item.id}`, {
        menu_category_id: item.menu_category_id,
        name: item.name,
        description: item.description,
        price: item.price,
        is_available: !item.is_available,
      });
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyItemId(null);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading menu items…" />;
  if (status === 'error') return <ErrorState label={error} />;

  if (categories.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h1>Menu Items</h1>
        <p>
          You need at least one menu category before adding items. <Link to="/manager/categories">Add one now</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Menu Items</h1>
        {mode === 'list' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Add item
          </button>
        )}
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3>{mode === 'edit' ? 'Edit item' : 'New item'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="menu_category_id">Category</label>
                <select id="menu_category_id" name="menu_category_id" value={form.menu_category_id} onChange={handleChange} required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.menu_category_id && <div className="field-error">{formErrors.menu_category_id[0]}</div>}
              </div>

              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
                {formErrors.name && <div className="field-error">{formErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label htmlFor="description">Description (optional)</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={2} />
              </div>

              <div className="field">
                <label htmlFor="price">Price ($)</label>
                <input id="price" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} required />
                {formErrors.price && <div className="field-error">{formErrors.price[0]}</div>}
              </div>

              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="is_available"
                  name="is_available"
                  type="checkbox"
                  checked={form.is_available}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="is_available" style={{ margin: 0 }}>
                  Available for order
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save item'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {items.length === 0 && mode === 'list' && <EmptyState label="You haven't added any menu items yet." />}

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{item.name}</strong>
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-muted'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, margin: '2px 0' }}>{categoryName(item.menu_category_id)}</p>
                  {item.description && <p style={{ fontSize: 14, margin: '4px 0' }}>{item.description}</p>}
                  <p style={{ fontWeight: 700, margin: 0 }}>${Number(item.price).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busyItemId === item.id}
                    onClick={() => toggleAvailability(item)}
                  >
                    Mark {item.is_available ? 'unavailable' : 'available'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(item)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
