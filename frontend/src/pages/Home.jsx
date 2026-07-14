import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { getErrorMessage } from '../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';
import RestaurantCard from '../components/RestaurantCard';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/restaurants', { params: { per_page: 3 } })
      .then((response) => {
        setRestaurants(response.data.data);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, []);

  return (
    <div className="container">
      <section style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <h1>Food from your favorite local spots, delivered.</h1>
        <p style={{ fontSize: 18, maxWidth: 560, margin: '0 auto 20px' }}>
          Browse restaurants near you, build your order, and pay cash on delivery.
        </p>
        <Link to="/restaurants" className="btn btn-primary">
          Browse restaurants
        </Link>
      </section>

      <section>
        <h2>Featured restaurants</h2>

        {status === 'loading' && <LoadingState label="Loading restaurants…" />}
        {status === 'error' && <ErrorState label={error} />}
        {status === 'success' && restaurants.length === 0 && (
          <EmptyState label="No restaurants are available right now." />
        )}
        {status === 'success' && restaurants.length > 0 && (
          <div className="grid">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
