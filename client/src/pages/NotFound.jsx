import { Link } from 'react-router-dom';

/**
 * NotFound — catch-all 404 page for any route that doesn't match
 * one defined in App.jsx.
 */
function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-code">404</div>
      <h1 className="notfound-title">Page not found</h1>
      <p className="notfound-sub">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn-primary"
        style={{ padding: '12px 28px', fontSize: '15px' }}
      >
        Back to home
      </Link>
    </div>
  );
}

export default NotFound;
