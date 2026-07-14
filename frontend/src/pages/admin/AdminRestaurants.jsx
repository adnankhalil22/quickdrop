import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';

const emptyForm = {
  manager_id: '',
  name: '',
  description: '',
  phone: '',
  address: '',
  opening_time: '',
  closing_time: '',
  delivery_fee: '',
  minimum_order: '',
  is_active: true,
};

export default function AdminRestaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);

  const [restaurants, setRestaurants] = useState([]);
  const [meta, setMeta] = useState(null);
  const [managers, setManagers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  function loadData() {
    setStatus('loading');
    Promise.all([
      client.get('/admin/restaurants', { params: { page, per_page: 12 } }),
      client.get('/admin/users', { params: { role: 'manager' } }),
    ])
      .then(([restaurantsResponse, managersResponse]) => {
        setRestaurants(restaurantsResponse.data.data);
        setMeta(restaurantsResponse.data.meta);
        setManagers(managersResponse.data.users);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadData, [page]);

  function goToPage(nextPage) {
    setSearchParams({ page: String(nextPage) });
  }

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setActionError('');
    setMode('create');
  }

  function startEdit(restaurant) {
    setEditing(restaurant);
    setForm({
      manager_id: restaurant.manager_id || '',
      name: restaurant.name,
      description: restaurant.description || '',
      phone: restaurant.phone || '',
      address: restaurant.address,
      opening_time: restaurant.opening_time?.slice(0, 5) || '',
      closing_time: restaurant.closing_time?.slice(0, 5) || '',
      delivery_fee: restaurant.delivery_fee,
      minimum_order: restaurant.minimum_order,
      is_active: restaurant.is_active,
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

    const payload = { ...form, manager_id: form.manager_id || null };

    try {
      if (mode === 'edit') {
        await client.put(`/admin/restaurants/${editing.id}`, payload);
      } else {
        await client.post('/admin/restaurants', payload);
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

  async function handleDelete(restaurant) {
    if (!confirm(`Delete "${restaurant.name}"? This also deletes its menu, carts, and orders.`)) return;
    try {
      await client.delete(`/admin/restaurants/${restaurant.id}`);
      loadData();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  function managerName(id) {
    return managers.find((m) => m.id === id)?.name;
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Manage Restaurants</h1>
        {mode === 'list' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Add restaurant
          </button>
        )}
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3>{mode === 'edit' ? 'Edit restaurant' : 'New restaurant'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
                {formErrors.name && <div className="field-error">{formErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={2} />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>

              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} required />
                {formErrors.address && <div className="field-error">{formErrors.address[0]}</div>}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="opening_time">Opening time</label>
                  <input id="opening_time" name="opening_time" type="time" value={form.opening_time} onChange={handleChange} required />
                  {formErrors.opening_time && <div className="field-error">{formErrors.opening_time[0]}</div>}
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="closing_time">Closing time</label>
                  <input id="closing_time" name="closing_time" type="time" value={form.closing_time} onChange={handleChange} required />
                  {formErrors.closing_time && <div className="field-error">{formErrors.closing_time[0]}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="delivery_fee">Delivery fee ($)</label>
                  <input
                    id="delivery_fee"
                    name="delivery_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.delivery_fee}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.delivery_fee && <div className="field-error">{formErrors.delivery_fee[0]}</div>}
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="minimum_order">Minimum order ($)</label>
                  <input
                    id="minimum_order"
                    name="minimum_order"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.minimum_order}
                    onChange={handleChange}
                    required
                  />
                  {formErrors.minimum_order && <div className="field-error">{formErrors.minimum_order[0]}</div>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="manager_id">Manager</label>
                <select id="manager_id" name="manager_id" value={form.manager_id} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {formErrors.manager_id && <div className="field-error">{formErrors.manager_id[0]}</div>}
              </div>

              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                  style={{ width: 'auto' }}
                />
                <label htmlFor="is_active" style={{ margin: 0 }}>
                  Active (visible to customers)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save restaurant'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading restaurants…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && restaurants.length === 0 && mode === 'list' && <EmptyState label="No restaurants yet." />}

      {status === 'success' && restaurants.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="card">
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong>{restaurant.name}</strong>
                      <span className={`badge ${restaurant.is_active ? 'badge-success' : 'badge-muted'}`}>
                        {restaurant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, margin: '2px 0 0' }}>
                      {managerName(restaurant.manager_id) || 'No manager assigned'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(restaurant)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(restaurant)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 14 }}>
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
