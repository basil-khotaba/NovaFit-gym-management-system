import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ClassCard from '../components/ClassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * Home — the landing page.
 * Hero section + live preview of classes fetched from the backend.
 */
function Home() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = () => {
    setLoading(true);
    setError(null);
    api
      .get('/classes')
      .then((res) => setClasses(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load classes')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div>
      {/* --- Hero section --- */}
      <section className="hero">
        <div className="hero-accent"></div>
        <span className="hero-tag">New — Group classes added</span>
        <h1>
          Train harder.<br />
          Push <span>limits.</span><br />
          Get results.
        </h1>
        <p>
          Book classes, track your membership, and connect with expert
          trainers — all in one place.
        </p>
        <div className="hero-actions">
          <Link to="/classes" className="btn-primary" style={{ padding: '10px 22px' }}>
            Browse classes
          </Link>
          <Link to="/trainers" className="btn-ghost" style={{ padding: '10px 18px' }}>
            Meet trainers
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-num">{classes.length}</div>
            <div className="stat-label">Classes available</div>
          </div>
          <div>
            <div className="stat-num">12</div>
            <div className="stat-label">Expert trainers</div>
          </div>
          <div>
            <div className="stat-num">2,400+</div>
            <div className="stat-label">Active members</div>
          </div>
        </div>
      </section>

      {/* --- Classes preview --- */}
      <section className="page">
        <div className="section-header">
          <h2 className="section-title">Upcoming classes</h2>
          <Link to="/classes" className="section-link">View all →</Link>
        </div>

        {loading && <LoadingSpinner message="Loading classes..." />}
        {error && <ErrorMessage message={error} onRetry={fetchClasses} />}
        {!loading && !error && classes.length === 0 && (
          <p style={{ color: 'var(--text-dim)' }}>
            No classes yet. Check back soon!
          </p>
        )}
        {!loading && !error && classes.length > 0 && (
          <div className="classes-grid">
            {classes.slice(0, 6).map((c) => (
              <ClassCard key={c._id} gymClass={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;