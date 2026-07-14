import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
      {restaurant.image ? (
        <div className="card-media" style={{ backgroundImage: `url(${restaurant.image})` }} />
      ) : (
        <div className="card-media">
          <div className="card-media-placeholder">🍽️</div>
        </div>
      )}
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{ marginBottom: 4 }}>{restaurant.name}</h3>
          {restaurant.is_active === false && <span className="badge badge-muted">Inactive</span>}
        </div>
        <p style={{ fontSize: 14, marginBottom: 10 }}>
          {restaurant.opening_time?.slice(0, 5)} – {restaurant.closing_time?.slice(0, 5)}
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-text)' }}>
          Delivery ${Number(restaurant.delivery_fee).toFixed(2)} · Min. order $
          {Number(restaurant.minimum_order).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
