import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ClassCard from '../components/ClassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import HeroAnimation from '../components/HeroAnimation';

/**
 * Home — the landing page.
 * Hero section + live preview of classes fetched from the backend.
 */
function Home() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({ members: null, trainers: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchClasses is used as the "Try Again" retry handler passed to
  // ErrorMessage — it explicitly resets loading/error before refetching.
  const fetchClasses = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.get('/classes'), api.get('/stats')])
      .then(([cls, st]) => {
        setClasses(cls.data.data);
        setStats(st.data.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load classes')
      )
      .finally(() => setLoading(false));
  };

  // Initial load on mount. loading already starts true, so this doesn't
  // need to set it again — only the async callbacks touch state here.
  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/stats')])
      .then(([cls, st]) => {
        setClasses(cls.data.data);
        setStats(st.data.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load classes')
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* --- Hero section --- */}
      <section className="hero">
        <div className="hero-accent"></div>
        <div className="hero-figure">
          <HeroAnimation />
        </div>
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
          <Link to="/classes" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Browse classes
          </Link>
          <Link to="/trainers" className="btn-ghost" style={{ padding: '14px 28px', fontSize: '16px' }}>
            Meet trainers
          </Link>
        </div>
        <div className="hero-stats">
          {/* Prefer the live /stats count; fall back to the fetched list
              length so something reasonable shows before /stats resolves */}
          <div>
            <div className="stat-num">{stats.classes ?? classes.length}</div>
            <div className="stat-label">Classes available</div>
          </div>
          <div>
            <div className="stat-num">{stats.trainers ?? '—'}</div>
            <div className="stat-label">Expert trainers</div>
          </div>
          <div>
            <div className="stat-num">{stats.members ?? '—'}</div>
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