import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';

function StatTile({ label, value }) {
  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/admin/dashboard')
      .then((response) => {
        setStats(response.data);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <LoadingState label="Loading dashboard…" />;
  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <h2 style={{ marginTop: 24 }}>Users</h2>
      <div className="grid">
        <StatTile label="Total" value={stats.users.total} />
        <StatTile label="Customers" value={stats.users.customers} />
        <StatTile label="Managers" value={stats.users.managers} />
        <StatTile label="Admins" value={stats.users.admins} />
      </div>

      <h2 style={{ marginTop: 24 }}>Restaurants</h2>
      <div className="grid">
        <StatTile label="Total" value={stats.restaurants.total} />
        <StatTile label="Active" value={stats.restaurants.active} />
        <StatTile label="Inactive" value={stats.restaurants.inactive} />
      </div>

      <h2 style={{ marginTop: 24 }}>Orders</h2>
      <div className="grid">
        <StatTile label="Total" value={stats.orders.total} />
        <StatTile label="Pending" value={stats.orders.pending} />
        <StatTile label="Accepted" value={stats.orders.accepted} />
        <StatTile label="Preparing" value={stats.orders.preparing} />
        <StatTile label="Out for delivery" value={stats.orders.out_for_delivery} />
        <StatTile label="Delivered" value={stats.orders.delivered} />
        <StatTile label="Cancelled" value={stats.orders.cancelled} />
        <StatTile label="Rejected" value={stats.orders.rejected} />
      </div>

      <h2 style={{ marginTop: 24 }}>Revenue</h2>
      <div className="grid">
        <StatTile label="From delivered orders" value={`$${Number(stats.revenue).toFixed(2)}`} />
      </div>

      <div className="grid" style={{ marginTop: 32 }}>
        <Link to="/admin/users" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>Manage Users</h3>
            <p style={{ fontSize: 14 }}>Create customers, managers, and admins.</p>
          </div>
        </Link>
        <Link to="/admin/restaurants" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>Manage Restaurants</h3>
            <p style={{ fontSize: 14 }}>Create, assign managers, activate/deactivate.</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>All Orders</h3>
            <p style={{ fontSize: 14 }}>View and manage orders across every restaurant.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
