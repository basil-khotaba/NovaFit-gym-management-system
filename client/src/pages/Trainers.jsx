import { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace('/api', '');

function TrainerCard({ trainer }) {
  return (
    <div className="trainer-card">
      <div className="trainer-photo">
        {trainer.photo ? (
          <img
            src={`${API_ORIGIN}${trainer.photo}`}
            alt={trainer.name}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="trainer-photo-placeholder">👤</div>
        )}
      </div>
      <div className="trainer-info">
        <div className="trainer-name">{trainer.name}</div>
        {trainer.rating != null && (
          <div className="trainer-rating">★ {Number(trainer.rating).toFixed(1)}</div>
        )}
        {trainer.bio && <p className="trainer-bio">{trainer.bio}</p>}
        {trainer.specialties?.length > 0 && (
          <div className="specialties-list">
            {trainer.specialties.map((s, i) => (
              <span key={i} className="specialty-tag">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // loading starts true; setState only inside async callbacks.
  useEffect(() => {
    api
      .get('/trainers')
      .then((res) => setTrainers(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load trainers')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    api
      .get('/trainers')
      .then((res) => setTrainers(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load trainers')
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Our Trainers</h1>
          <p className="page-sub">Meet the experts who will guide your journey</p>
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading trainers..." />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}
      {!loading && !error && trainers.length === 0 && (
        <div className="empty-state">
          <p>No trainers listed yet.</p>
        </div>
      )}
      {!loading && !error && trainers.length > 0 && (
        <div className="trainers-grid">
          {trainers.map((t) => (
            <TrainerCard key={t._id} trainer={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Trainers;
