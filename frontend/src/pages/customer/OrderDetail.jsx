import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';
import { getStatusBadgeClass, formatStatusLabel } from '../../utils/orderStatus';

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  function loadOrder() {
    setStatus('loading');
    client
      .get(`/orders/${id}`)
      .then((response) => {
        setOrder(response.data.order);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }

  useEffect(loadOrder, [id]);

  async function handleCancel() {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const response = await client.post(`/orders/${id}/cancel`);
      setOrder(response.data.order);
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading order…" />;
  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>Order #{order.id}</h1>
          <p style={{ margin: 0 }}>{new Date(order.ordered_at).toLocaleString()}</p>
        </div>
        <span className={`badge ${getStatusBadgeClass(order.status)}`}>{formatStatusLabel(order.status)}</span>
      </div>

      {cancelError && <div className="alert alert-danger">{cancelError}</div>}

      <div className="card" style={{ margin: '20px 0' }}>
        <div className="card-body">
          <h3>{order.restaurant.name}</h3>
          <p style={{ fontSize: 14 }}>Payment: cash on delivery</p>
          {order.customer_notes && <p style={{ fontSize: 14 }}>Notes: {order.customer_notes}</p>}

          <h4 style={{ marginTop: 16 }}>Delivery address</h4>
          <p style={{ fontSize: 14, margin: 0 }}>
            {order.address.label} — {order.address.street}, Building {order.address.building}, {order.address.area},{' '}
            {order.address.city}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3>Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="summary-line" style={{ marginBottom: 6 }}>
              <span>
                {item.quantity} × {item.item_name}
              </span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Delivery fee</span>
              <span>${Number(order.delivery_fee).toFixed(2)}</span>
            </div>
            <div className="summary-line" style={{ fontWeight: 700 }}>
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {order.status === 'pending' && (
        <button type="button" className="btn btn-danger" style={{ marginTop: 16 }} onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling…' : 'Cancel order'}
        </button>
      )}
    </div>
  );
}
