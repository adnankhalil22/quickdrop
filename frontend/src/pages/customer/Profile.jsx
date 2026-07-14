import { useEffect, useState } from 'react';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, ErrorState } from '../../components/StateMessage';

export default function Profile() {
  const { updateUser } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    client
      .get('/profile')
      .then((response) => {
        const { name, email, phone } = response.data.user;
        setForm({ name, email, phone: phone || '' });
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
      const response = await client.put('/profile', form);
      updateUser(response.data.user);
      setSavedMessage('Profile updated successfully.');
    } catch (err) {
      setErrors(getValidationErrors(err));
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading profile…" />;
  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h1>My Profile</h1>

      {savedMessage && <div className="alert" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>{savedMessage}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
          {errors.name && <div className="field-error">{errors.name[0]}</div>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          {errors.email && <div className="field-error">{errors.email[0]}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          {errors.phone && <div className="field-error">{errors.phone[0]}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
