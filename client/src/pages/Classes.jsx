import { useState, useEffect } from 'react';
import api from '../services/api';
import ClassCard from '../components/ClassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CATEGORIES = ['All', 'Strength', 'Cardio', 'Yoga', 'HIIT'];

// Shared fetch helper — takes the state setters as params so it can be
// called both from the mount effect and from the category/retry handlers
// without duplicating the request + .then/.catch/.finally chain.
function doFetch(category, setClasses, setError, setLoading) {
  // 'All' means "no category filter" — omit the query param entirely
  // rather than sending category=All, which the backend wouldn't understand.
  const params = category && category !== 'All' ? { category } : {};
  api
    .get('/classes', { params })
    .then((res) => setClasses(res.data.data))
    .catch((err) =>
      setError(err.response?.data?.message || 'Could not load classes')
    )
    .finally(() => setLoading(false));
}

/**
 * Classes — browsable, filterable list of all gym classes.
 */
function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // On mount: loading is already true; setState only happens in async callbacks.
  useEffect(() => {
    doFetch(activeCategory, setClasses, setError, setLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Category change comes from a click event — resetting state here is fine.
  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setLoading(true);
    setError(null);
    doFetch(cat, setClasses, setError, setLoading);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    doFetch(activeCategory, setClasses, setError, setLoading);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          {!loading && !error && (
            <p className="page-sub">
              {classes.length} class{classes.length !== 1 ? 'es' : ''} available
            </p>
          )}
        </div>
      </div>

      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner message="Loading classes..." />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}
      {!loading && !error && classes.length === 0 && (
        <div className="empty-state">
          <p>
            No classes found
            {activeCategory !== 'All' ? ` for ${activeCategory}` : ''}.
          </p>
        </div>
      )}
      {!loading && !error && classes.length > 0 && (
        <div className="classes-grid">
          {classes.map((c) => (
            <ClassCard key={c._id} gymClass={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Classes;
