import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          QuickDrop
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/restaurants" onClick={closeMenu}>
            Restaurants
          </Link>

          {isAuthenticated && user.role === 'customer' && (
            <>
              <Link to="/cart" onClick={closeMenu}>Cart</Link>
              <Link to="/orders" onClick={closeMenu}>My Orders</Link>
              <Link to="/addresses" onClick={closeMenu}>Addresses</Link>
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
            </>
          )}

          {isAuthenticated && user.role === 'manager' && (
            <>
              <Link to="/manager" onClick={closeMenu}>Dashboard</Link>
              <Link to="/manager/restaurant" onClick={closeMenu}>Restaurant</Link>
              <Link to="/manager/categories" onClick={closeMenu}>Categories</Link>
              <Link to="/manager/menu-items" onClick={closeMenu}>Menu Items</Link>
              <Link to="/manager/orders" onClick={closeMenu}>Orders</Link>
            </>
          )}

          {isAuthenticated && user.role === 'admin' && (
            <>
              <Link to="/admin" onClick={closeMenu}>Dashboard</Link>
              <Link to="/admin/users" onClick={closeMenu}>Users</Link>
              <Link to="/admin/restaurants" onClick={closeMenu}>Restaurants</Link>
              <Link to="/admin/orders" onClick={closeMenu}>Orders</Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="navbar-account">
              <span className="navbar-user">
                Signed in as <strong>{user.name}</strong> ({user.role})
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-account">
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
