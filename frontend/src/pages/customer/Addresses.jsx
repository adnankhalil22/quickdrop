import { useEffect, useState } from 'react';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';
import AddressForm from '../../components/AddressForm';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');

  function loadAddresses() {
    setStatus('loading');
    client
      .get('/addresses')
      .then((response) => {
        setAddresses(response.data.addresses);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadAddresses, []);

  function startCreate() {
    setEditingAddress(null);
    setFormErrors({});
    setActionError('');
    setMode('create');
  }

  function startEdit(address) {
    setEditingAddress(address);
    setFormErrors({});
    setActionError('');
    setMode('edit');
  }

  function cancelForm() {
    setMode('list');
  }

  async function handleSubmit(values) {
    setSubmitting(true);
    setFormErrors({});
    setActionError('');

    try {
      if (mode === 'edit') {
        await client.put(`/addresses/${editingAddress.id}`, values);
      } else {
        await client.post('/addresses', values);
      }
      setMode('list');
      loadAddresses();
    } catch (err) {
      setFormErrors(getValidationErrors(err));
      setActionError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(address) {
    if (!confirm(`Delete the "${address.label}" address?`)) return;

    try {
      await client.delete(`/addresses/${address.id}`);
      loadAddresses();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1>My Addresses</h1>
        {mode === 'list' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startCreate}>
            Add address
          </button>
        )}
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      {(mode === 'create' || mode === 'edit') && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3>{mode === 'edit' ? 'Edit address' : 'New address'}</h3>
            <AddressForm
              key={editingAddress?.id ?? 'new'}
              initialValues={editingAddress}
              onSubmit={handleSubmit}
              onCancel={cancelForm}
              submitting={submitting}
              errors={formErrors}
            />
          </div>
        </div>
      )}

      {status === 'loading' && <LoadingState label="Loading addresses…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && addresses.length === 0 && mode === 'list' && (
        <EmptyState label="You haven't added any delivery addresses yet." />
      )}

      {status === 'success' && addresses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {addresses.map((address) => (
            <div key={address.id} className="card">
              <div className="card-body list-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <strong>{address.label}</strong>
                    {address.is_default && <span className="badge badge-success">Default</span>}
                  </div>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {address.street}, Building {address.building}
                    {address.floor ? `, Floor ${address.floor}` : ''}
                  </p>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    {address.area}, {address.city}
                  </p>
                  {address.details && <p style={{ fontSize: 13, margin: 0 }}>{address.details}</p>}
                </div>
                <div className="list-row-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(address)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(address)}>
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
