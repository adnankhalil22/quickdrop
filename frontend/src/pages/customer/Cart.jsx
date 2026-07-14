import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);

  function loadCart() {
    setStatus('loading');
    client
      .get('/cart')
      .then((response) => {
        setCart(response.data.cart);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadCart, []);

  async function updateQuantity(item, quantity) {
    if (quantity < 1) return;
    setBusyItemId(item.id);
    try {
      const response = await client.put(`/cart/items/${item.id}`, { quantity, notes: item.notes });
      setCart(response.data.cart);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(item) {
    setBusyItemId(item.id);
    try {
      const response = await client.delete(`/cart/items/${item.id}`);
      setCart(response.data.cart);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyItemId(null);
    }
  }

  async function clearCart() {
    if (!confirm('Clear your entire cart?')) return;
    try {
      await client.delete('/cart');
      setCart(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (status === 'loading') return <LoadingState label="Loading your cart…" />;
  if (status === 'error') return <ErrorState label={error} />;

  if (!cart) {
    return (
      <div className="container">
        <h1>Your Cart</h1>
        <EmptyState label="Your cart is empty." />
        <div style={{ textAlign: 'center' }}>
          <Link to="/restaurants" className="btn btn-primary">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>Your Cart</h1>
      <p>
        Ordering from <strong>{cart.restaurant.name}</strong>
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {cart.items.map((item) => (
          <div key={item.id} className="card">
            <div className="card-body list-row">
              <div className="thumb-row">
                {item.image && <div className="thumb" style={{ backgroundImage: `url(${item.image})` }} />}
                <div>
                  <strong>{item.name}</strong>
                  <p style={{ fontSize: 14, margin: '2px 0' }}>${Number(item.unit_price).toFixed(2)} each</p>
                  {item.notes && <p style={{ fontSize: 13, margin: 0 }}>Note: {item.notes}</p>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busyItemId === item.id || item.quantity <= 1}
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busyItemId === item.id}
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p style={{ fontWeight: 700, margin: '6px 0' }}>${Number(item.subtotal).toFixed(2)}</p>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={busyItemId === item.id}
                  onClick={() => removeItem(item)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>${Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery fee</span>
            <span>${Number(cart.delivery_fee).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}>
            <span>Total</span>
            <span>${Number(cart.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" className="btn btn-secondary" onClick={clearCart}>
          Clear cart
        </button>
        <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
