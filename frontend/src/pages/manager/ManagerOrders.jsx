import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateMessage';
import { getStatusBadgeClass, formatStatusLabel } from '../../utils/orderStatus';

export default function ManagerOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    client
      .get('/manager/orders', { params: { page } })
      .then((response) => {
        setOrders(response.data.data);
        setMeta(response.data.meta);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, [page]);

  function goToPage(nextPage) {
    setSearchParams({ page: String(nextPage) });
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1>Restaurant Orders</h1>

      {status === 'loading' && <LoadingState label="Loading orders…" />}
      {status === 'error' && <ErrorState label={error} />}
      {status === 'success' && orders.length === 0 && <EmptyState label="No orders yet." />}

      {status === 'success' && orders.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/manager/orders/${order.id}`}
                className="card"
                style={{ display: 'block', color: 'inherit' }}
              >
                <div className="card-body list-row">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <p style={{ fontSize: 13, margin: '2px 0 0' }}>
                      {order.user.name} · {new Date(order.ordered_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {formatStatusLabel(order.status)}
                    </span>
                    <p style={{ fontWeight: 700, margin: '6px 0 0' }}>${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 14 }}>
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
