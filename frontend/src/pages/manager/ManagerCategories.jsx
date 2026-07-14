import { useEffect, useState } from 'react';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';

const emptyForm = { name: '', description: '' };

export default function ManagerCategories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  function loadCategories() {
    setStatus('loading');
    client
      .get('/manager/categories')
      .then((response) => {
        setCategories(response.data.categories);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadCategories, []);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setActionError('');
    setMode('create');
  }

  function startEdit(category) {
    setEditing(category);
    setForm({ name: category.name, description: category.description || '' });
    setFormErrors({});
    setActionError('');
    setMode('edit');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      if (mode === 'edit') {
        await client.put(`/manager/categories/${editing.id}`, form);
      } else {
        await client.post('/manager/categories', form);
      }
      setMode('list');
      loadCategories();
    } catch (err) {
      setFormErrors(getValidationErrors(err));
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Delete "${category.name}"? This also deletes its menu items.`)) return;
    try {
      await client.delete(`/manager/categories/${category.id}`);
      loadCategories();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Menu Categories</h1>
        {mode === 'list' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Add category
          </button>
        )}
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3>{mode === 'edit' ? 'Edit category' : 'New category'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
                {formErrors.name && <div className="field-error">{formErrors.name[0]}</div>}
              </div>
              <div className="field">
                <label htmlFor="description">Description (optional)</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save category'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading categories…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && categories.length === 0 && mode === 'list' && (
        <EmptyState label="You haven't added any menu categories yet." />
      )}

      {status === 'success' && categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{category.name}</strong>
                  {category.description && <p style={{ fontSize: 14, margin: '4px 0 0' }}>{category.description}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(category)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(category)}>
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
