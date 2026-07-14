import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { getErrorMessage } from '../../api/errors';
import { LoadingState, ErrorState } from '../../components/StateMessage';

export default function ManagerDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [unassigned, setUnassigned] = useState(false);

  useEffect(() => {
    client
      .get('/manager/restaurant')
      .then((response) => {
        setRestaurant(response.data.restaurant);
        setStatus('success');
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setUnassigned(true);
        } else {
          setError(getErrorMessage(err));
        }
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <LoadingState label="Loading your restaurant…" />;

  if (unassigned) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h1>No restaurant assigned</h1>
        <p>You haven't been assigned to a restaurant yet. Contact an administrator.</p>
      </div>
    );
  }

  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container">
      <h1>{restaurant.name}</h1>
      <p>
        Status:{' '}
        <span className={`badge ${restaurant.is_active ? 'badge-success' : 'badge-muted'}`}>
          {restaurant.is_active ? 'Active' : 'Inactive'}
        </span>
      </p>

      <div className="grid" style={{ marginTop: 20 }}>
        <Link to="/manager/restaurant" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>Restaurant Profile</h3>
            <p style={{ fontSize: 14 }}>Update your restaurant's info, hours, and fees.</p>
          </div>
        </Link>

        <Link to="/manager/categories" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>Menu Categories</h3>
            <p style={{ fontSize: 14 }}>Organize your menu into categories.</p>
          </div>
        </Link>

        <Link to="/manager/menu-items" className="card" style={{ display: 'block', color: 'inherit' }}>
          <div className="card-body">
            <h3>Menu Items</h3>
            <p style={{ fontSize: 14 }}>Add items, set prices, and mark availability.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
