import { useEffect, useState } from 'react';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'customer' };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  function loadUsers() {
    setStatus('loading');
    client
      .get('/admin/users', { params: roleFilter ? { role: roleFilter } : {} })
      .then((response) => {
        setUsers(response.data.users);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadUsers, [roleFilter]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setActionError('');
    setMode('create');
  }

  function startEdit(targetUser) {
    setEditing(targetUser);
    setForm({ name: targetUser.name, email: targetUser.email, phone: targetUser.phone || '', password: '', role: targetUser.role });
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
        const { password, ...payload } = form;
        await client.put(`/admin/users/${editing.id}`, payload);
      } else {
        await client.post('/admin/users', form);
      }
      setMode('list');
      loadUsers();
    } catch (err) {
      setFormErrors(getValidationErrors(err));
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(targetUser) {
    if (!confirm(`Delete "${targetUser.name}"?`)) return;
    try {
      await client.delete(`/admin/users/${targetUser.id}`);
      loadUsers();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Manage Users</h1>
        {mode === 'list' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Add user
          </button>
        )}
      </div>

      {mode === 'list' && (
        <div className="field" style={{ maxWidth: 220 }}>
          <label htmlFor="roleFilter">Filter by role</label>
          <select id="roleFilter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3>{mode === 'edit' ? 'Edit user' : 'New user'}</h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
                {formErrors.name && <div className="field-error">{formErrors.name[0]}</div>}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                {formErrors.email && <div className="field-error">{formErrors.email[0]}</div>}
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                {formErrors.phone && <div className="field-error">{formErrors.phone[0]}</div>}
              </div>

              {mode === 'create' && (
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
                  {formErrors.password && <div className="field-error">{formErrors.password[0]}</div>}
                </div>
              )}

              <div className="field">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={mode === 'edit' && editing.id === currentUser.id}
                >
                  <option value="customer">Customer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                {mode === 'edit' && editing.id === currentUser.id && (
                  <p style={{ fontSize: 13, marginTop: 4 }}>You can't change your own role.</p>
                )}
                {formErrors.role && <div className="field-error">{formErrors.role[0]}</div>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save user'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading users…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && users.length === 0 && mode === 'list' && <EmptyState label="No users found." />}

      {status === 'success' && users.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map((targetUser) => (
            <div key={targetUser.id} className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{targetUser.name}</strong>
                    <span className="badge badge-info">{targetUser.role}</span>
                    {targetUser.id === currentUser.id && <span className="badge badge-muted">You</span>}
                  </div>
                  <p style={{ fontSize: 14, margin: '2px 0 0' }}>
                    {targetUser.email} {targetUser.phone ? `· ${targetUser.phone}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(targetUser)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={targetUser.id === currentUser.id}
                    onClick={() => handleDelete(targetUser)}
                  >
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
