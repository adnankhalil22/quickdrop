import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';
import { getStatusBadgeClass, formatStatusLabel, getAdminNextStatuses } from '../../utils/orderStatus';

const ACTION_LABELS = {
  accepted: 'Accept order',
  rejected: 'Reject order',
  preparing: 'Start preparing',
  out_for_delivery: 'Send out for delivery',
  delivered: 'Mark delivered',
  cancelled: 'Cancel order',
};

export default function AdminOrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [actionError, setActionError] = useState('');

  function loadOrder() {
    setStatus('loading');
    client
      .get(`/admin/orders/${id}`)
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

  async function updateStatus(nextStatus) {
    if ((nextStatus === 'rejected' || nextStatus === 'cancelled') && !confirm(`${ACTION_LABELS[nextStatus]}?`)) return;
    setUpdating(nextStatus);
    setActionError('');
    try {
      const response = await client.put(`/admin/orders/${id}/status`, { status: nextStatus });
      setOrder(response.data.order);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  }

  if (status === 'loading') return <LoadingState label="Loading order…" />;
  if (status === 'error') return <ErrorState label={error} />;

  const nextStatuses = getAdminNextStatuses(order.status);

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Order #{order.id}</h1>
          <p style={{ margin: 0 }}>{new Date(order.ordered_at).toLocaleString()}</p>
        </div>
        <span className={`badge ${getStatusBadgeClass(order.status)}`}>{formatStatusLabel(order.status)}</span>
      </div>

      {actionError && <div className="alert alert-danger">{actionError}</div>}

      <div className="card" style={{ margin: '20px 0' }}>
        <div className="card-body">
          <h3>{order.restaurant.name}</h3>
          <p style={{ fontSize: 14, margin: 0 }}>
            Customer: {order.user.name} · {order.user.phone || order.user.email}
          </p>
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
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>
                {item.quantity} × {item.item_name}
              </span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery fee</span>
              <span>${Number(order.delivery_fee).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {nextStatuses.map((nextStatus) => (
            <button
              key={nextStatus}
              type="button"
              className={nextStatus === 'rejected' || nextStatus === 'cancelled' ? 'btn btn-danger' : 'btn btn-primary'}
              disabled={updating !== null}
              onClick={() => updateStatus(nextStatus)}
            >
              {updating === nextStatus ? 'Updating…' : ACTION_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
