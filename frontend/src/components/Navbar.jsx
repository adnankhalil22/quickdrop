import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          QuickDrop
        </Link>

        <nav className="navbar-links">
          <Link to="/restaurants">Restaurants</Link>

          {isAuthenticated && user.role === 'customer' && (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/addresses">Addresses</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}

          {isAuthenticated && user.role === 'manager' && (
            <>
              <Link to="/manager">Dashboard</Link>
              <Link to="/manager/restaurant">Restaurant</Link>
              <Link to="/manager/categories">Categories</Link>
              <Link to="/manager/menu-items">Menu Items</Link>
              <Link to="/manager/orders">Orders</Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Signed in as <strong>{user.name}</strong> ({user.role})
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
