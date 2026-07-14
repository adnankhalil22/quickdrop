import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage, getValidationErrors } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';
import { getStatusBadgeClass, formatStatusLabel } from '../../utils/orderStatus';

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [addressId, setAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    Promise.all([client.get('/cart'), client.get('/addresses')])
      .then(([cartResponse, addressesResponse]) => {
        setCart(cartResponse.data.cart);
        const list = addressesResponse.data.addresses;
        setAddresses(list);
        const defaultAddress = list.find((a) => a.is_default) || list[0];
        if (defaultAddress) setAddressId(String(defaultAddress.id));
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setError('');

    try {
      const response = await client.post('/orders', {
        address_id: Number(addressId),
        customer_notes: notes || undefined,
      });
      setPlacedOrder(response.data.order);
    } catch (err) {
      setFormErrors(getValidationErrors(err));
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading checkout…" />;
  if (status === 'error') return <ErrorState label={error} />;

  if (placedOrder) {
    return (
      <div className="container" style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1>Order placed!</h1>
        <p>
          Order #{placedOrder.id} from <strong>{placedOrder.restaurant.name}</strong> is now{' '}
          <span className={`badge ${getStatusBadgeClass(placedOrder.status)}`}>
            {formatStatusLabel(placedOrder.status)}
          </span>
          .
        </p>
        <p style={{ fontWeight: 700 }}>Total: ${Number(placedOrder.total).toFixed(2)}</p>
        <p>Payment: cash on delivery.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to={`/orders/${placedOrder.id}`} className="btn btn-secondary">
            View order
          </Link>
          <Link to="/restaurants" className="btn btn-primary">
            Browse more restaurants
          </Link>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h1>Checkout</h1>
        <p>Your cart is empty, so there's nothing to check out.</p>
        <Link to="/restaurants" className="btn btn-primary">
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h1>Checkout</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3>Order summary</h3>
          <p>{cart.items.length} item(s) from {cart.restaurant.name}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>${Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery fee</span>
            <span>${Number(cart.delivery_fee).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span>
            <span>${Number(cart.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="alert alert-warning">
          You need a delivery address before you can check out.{' '}
          <Link to="/addresses">Add one now</Link>.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Delivery address</label>
            {addresses.map((address) => (
              <label
                key={address.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: 10,
                  marginBottom: 8,
                  fontWeight: 400,
                }}
              >
                <input
                  type="radio"
                  name="address_id"
                  value={address.id}
                  checked={addressId === String(address.id)}
                  onChange={(event) => setAddressId(event.target.value)}
                  style={{ width: 'auto', marginTop: 4 }}
                />
                <span>
                  <strong>{address.label}</strong>
                  <br />
                  {address.street}, Building {address.building}, {address.area}, {address.city}
                </span>
              </label>
            ))}
            {formErrors.address_id && <div className="field-error">{formErrors.address_id[0]}</div>}
          </div>

          <div className="field">
            <label htmlFor="notes">Notes for the restaurant (optional)</label>
            <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !addressId}>
            {submitting ? 'Placing order…' : `Place order · $${Number(cart.total).toFixed(2)}`}
          </button>
        </form>
      )}
    </div>
  );
}
