import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { createBooking } from '../store/bookingsSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

/**
 * ClassDetail — single class page with trainer info and a book button.
 *
 * Booking dispatches a Redux thunk (createBooking) rather than calling
 * the API directly, because a successful booking here needs to be
 * reflected on the MyBookings page too — the shared bookings slice keeps
 * both in sync without either page re-fetching from the server.
 */
function ClassDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [gymClass, setGymClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState(null);

  // Images are served from the API's origin, not the '/api' path.
  const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace('/api', '');

  // loading starts true; setState only inside async callbacks.
  useEffect(() => {
    api
      .get(`/classes/${id}`)
      .then((res) => setGymClass(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load class')
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    setBookingLoading(true);
    setBookingMsg(null);
    try {
      // .unwrap() turns the thunk's rejected action into a thrown value,
      // so the try/catch here can handle it like a normal async error
      // instead of having to check action.meta.requestStatus manually.
      await dispatch(createBooking(id)).unwrap();
      setBookingMsg({ type: 'success', text: 'Class booked! Check My Bookings.' });
    } catch (message) {
      setBookingMsg({
        type: 'error',
        text: message || 'Booking failed.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading class..." />;
  if (error)
    return (
      <div className="page">
        <ErrorMessage message={error} />
      </div>
    );
  if (!gymClass) return null;

  const category = (gymClass.category || '').toLowerCase();

  return (
    <div className="page">
      <Link to="/classes" className="back-link">← Back to classes</Link>

      <div className="detail-top">
        {/* Left: image */}
        <div className={`detail-img cat-${category}`}>
          {gymClass.image ? (
            <img
              src={`${API_ORIGIN}${gymClass.image}`}
              alt={gymClass.name}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span className="detail-img-icon">🏋️</span>
          )}
        </div>

        {/* Middle: class info */}
        <div className="detail-info">
          <span className={`badge badge-${category}`}>{gymClass.category}</span>
          <h1 className="detail-title">{gymClass.name}</h1>
          {gymClass.description && (
            <p className="detail-desc">{gymClass.description}</p>
          )}
          <div className="detail-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Duration</span>
              <span className="meta-value">{gymClass.durationMinutes} min</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Schedule</span>
              <span className="meta-value">{gymClass.schedule}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Capacity</span>
              <span className="meta-value">{gymClass.capacity} spots</span>
            </div>
          </div>
          {bookingMsg && (
            <div className={`booking-msg ${bookingMsg.type}`}>
              {bookingMsg.text}
            </div>
          )}
          {user ? (
            <button
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
              onClick={handleBook}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Booking...' : 'Book this class'}
            </button>
          ) : (
            <p className="auth-prompt">
              <Link to="/login">Sign in</Link> to book this class.
            </p>
          )}
        </div>

        {/* Right: trainer card */}
        {gymClass.trainer && (
          <aside className="trainer-card-detail">
            <div className="card-section-title">Trainer</div>
            <div className="trainer-profile">
              <div className="trainer-avatar">
                {gymClass.trainer.photo ? (
                  <img
                    src={`${API_ORIGIN}${gymClass.trainer.photo}`}
                    alt={gymClass.trainer.name}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div>
                <div className="trainer-name">{gymClass.trainer.name}</div>
                {gymClass.trainer.rating != null && (
                  <div className="trainer-rating">
                    ★ {Number(gymClass.trainer.rating).toFixed(1)}
                  </div>
                )}
              </div>
            </div>
            {gymClass.trainer.bio && (
              <p className="trainer-bio-text">{gymClass.trainer.bio}</p>
            )}
            {gymClass.trainer.specialties?.length > 0 && (
              <div className="specialties-list">
                {gymClass.trainer.specialties.map((s, i) => (
                  <span key={i} className="specialty-tag">{s}</span>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

export default ClassDetail;
