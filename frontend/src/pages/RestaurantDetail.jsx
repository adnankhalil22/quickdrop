import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { getErrorMessage } from '../api/errors';
import { LoadingState, EmptyState, ErrorState } from '../components/StateMessage';

export default function RestaurantDetail() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus('loading');
    client
      .get(`/restaurants/${id}/menu`)
      .then((response) => {
        setRestaurant(response.data.restaurant);
        setCategories(response.data.categories);
        setStatus('success');
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus('error');
      });
  }, [id]);

  if (status === 'loading') return <LoadingState label="Loading menu…" />;
  if (status === 'error') return <ErrorState label={error} />;

  return (
    <div className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>{restaurant.name}</h1>
        {restaurant.description && <p>{restaurant.description}</p>}
        <p style={{ fontSize: 14 }}>
          {restaurant.address} · {restaurant.opening_time?.slice(0, 5)}–{restaurant.closing_time?.slice(0, 5)}
        </p>
        <p style={{ fontSize: 14 }}>
          Delivery fee ${Number(restaurant.delivery_fee).toFixed(2)} · Minimum order $
          {Number(restaurant.minimum_order).toFixed(2)}
        </p>
      </section>

      {categories.length === 0 && <EmptyState label="This restaurant hasn't added any menu items yet." />}

      {categories.map((category) => (
        <section key={category.id} style={{ marginBottom: 32 }}>
          <h2>{category.name}</h2>
          {category.description && <p>{category.description}</p>}

          <div className="grid">
            {category.menu_items.map((item) => (
              <div key={item.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ marginBottom: 4 }}>{item.name}</h3>
                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-muted'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  {item.description && <p style={{ fontSize: 14 }}>{item.description}</p>}
                  <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>${Number(item.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
