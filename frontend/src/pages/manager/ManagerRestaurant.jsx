import { useEffect, useState } from 'react';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';

const emptyForm = {
  name: '',
  description: '',
  phone: '',
  address: '',
  opening_time: '',
  closing_time: '',
  delivery_fee: '',
  minimum_order: '',
};

export default function ManagerRestaurant() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    client
      .get('/manager/restaurant')
      .then((response) => {
        const r = response.data.restaurant;
        setForm({
          name: r.name,
          description: r.description || '',
          phone: r.phone || '',
          address: r.address,
          opening_time: r.opening_time?.slice(0, 5) || '',
          closing_time: r.closing_time?.slice(0, 5) || '',
          delivery_fee: r.delivery_fee,
          minimum_order: r.minimum_order,
        });
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setSavedMessage('');

    try {
      const response = await client.put('/manager/restaurant', form);
      setSavedMessage('Restaurant updated successfully.');
      const r = response.data.restaurant;
      setForm((prev) => ({ ...prev, opening_time: r.opening_time?.slice(0, 5), closing_time: r.closing_time?.slice(0, 5) }));
    } catch (err) {
      setErrors(getValidationErrors(err));
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading restaurant…" />;
  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h1>Restaurant Profile</h1>

      {savedMessage && (
        <div className="alert" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
          {savedMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
          {errors.name && <div className="field-error">{errors.name[0]}</div>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} />
          {errors.description && <div className="field-error">{errors.description[0]}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          {errors.phone && <div className="field-error">{errors.phone[0]}</div>}
        </div>

        <div className="field">
          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={form.address} onChange={handleChange} required />
          {errors.address && <div className="field-error">{errors.address[0]}</div>}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="opening_time">Opening time</label>
            <input id="opening_time" name="opening_time" type="time" value={form.opening_time} onChange={handleChange} required />
            {errors.opening_time && <div className="field-error">{errors.opening_time[0]}</div>}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="closing_time">Closing time</label>
            <input id="closing_time" name="closing_time" type="time" value={form.closing_time} onChange={handleChange} required />
            {errors.closing_time && <div className="field-error">{errors.closing_time[0]}</div>}
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
            {errors.delivery_fee && <div className="field-error">{errors.delivery_fee[0]}</div>}
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
            {errors.minimum_order && <div className="field-error">{errors.minimum_order[0]}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
