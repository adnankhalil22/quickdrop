import { useState } from 'react';

const emptyAddress = {
  label: '',
  city: '',
  area: '',
  street: '',
  building: '',
  floor: '',
  details: '',
  is_default: false,
};

export default function AddressForm({ initialValues, onSubmit, onCancel, submitting, errors = {} }) {
  const [form, setForm] = useState({ ...emptyAddress, ...initialValues });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="label">Label</label>
        <input id="label" name="label" value={form.label} onChange={handleChange} placeholder="Home, Work…" required />
        {errors.label && <div className="field-error">{errors.label[0]}</div>}
      </div>

      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" name="city" value={form.city} onChange={handleChange} required />
        {errors.city && <div className="field-error">{errors.city[0]}</div>}
      </div>

      <div className="field">
        <label htmlFor="area">Area</label>
        <input id="area" name="area" value={form.area} onChange={handleChange} required />
        {errors.area && <div className="field-error">{errors.area[0]}</div>}
      </div>

      <div className="field">
        <label htmlFor="street">Street</label>
        <input id="street" name="street" value={form.street} onChange={handleChange} required />
        {errors.street && <div className="field-error">{errors.street[0]}</div>}
      </div>

      <div className="field">
        <label htmlFor="building">Building</label>
        <input id="building" name="building" value={form.building} onChange={handleChange} required />
        {errors.building && <div className="field-error">{errors.building[0]}</div>}
      </div>

      <div className="field">
        <label htmlFor="floor">Floor (optional)</label>
        <input id="floor" name="floor" value={form.floor} onChange={handleChange} />
      </div>

      <div className="field">
        <label htmlFor="details">Details (optional)</label>
        <textarea id="details" name="details" value={form.details} onChange={handleChange} rows={2} />
      </div>

      <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="is_default"
          name="is_default"
          type="checkbox"
          checked={form.is_default}
          onChange={handleChange}
          style={{ width: 'auto' }}
        />
        <label htmlFor="is_default" style={{ margin: 0 }}>
          Set as default address
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save address'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
