import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute — wraps any page that requires the user to be logged in.
 * If not logged in, redirects to /login.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking the token on app load, show nothing yet.
  if (loading) return null;

  // Not logged in → send to login, remembering where they wanted to go.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;