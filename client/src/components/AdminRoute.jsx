import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — wraps admin-only pages.
 * Redirects non-admins away.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in, or logged in but not an admin → send home.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;