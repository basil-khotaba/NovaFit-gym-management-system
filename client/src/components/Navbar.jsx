import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — top navigation bar, shown on every page.
 * Shows different links depending on whether a user is logged in.
 */
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        NOVA<span>FIT</span>
      </Link>

      <div className="nav-links">
        <Link to="/classes">Classes</Link>
        <Link to="/trainers">Trainers</Link>
        <Link to="/memberships">Memberships</Link>
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Join now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;