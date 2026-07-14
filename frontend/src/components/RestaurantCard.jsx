import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
      <div
        style={{
          height: 140,
          background: restaurant.image ? `url(${restaurant.image}) center/cover` : 'var(--color-primary-light)',
          borderTopLeftRadius: 'var(--radius)',
          borderTopRightRadius: 'var(--radius)',
        }}
      />
      <div className="card-body">
        <h3 style={{ marginBottom: 4 }}>{restaurant.name}</h3>
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
