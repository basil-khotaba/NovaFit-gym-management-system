import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute — wraps admin-only pages.
 * Redirects non-admins away.
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // While AuthContext is still verifying a stored token, render nothing
  // rather than redirecting — redirecting here would briefly bounce a
  // logged-in admin to "/" before their session finishes loading.
  if (loading) return null;

  // Not logged in, or logged in but not an admin → send home.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;