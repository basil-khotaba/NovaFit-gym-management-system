import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking } from '../store/bookingsSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Presentational row for one booking. onCancel/cancelling are omitted for
// already-cancelled bookings (see the render below), so this component
// treats them as optional.
function BookingRow({ booking, onCancel, cancelling, cancelled }) {
  const cls = booking.class;
  // Defensive guard: if the class was deleted after the booking was made,
  // booking.class may come back null/unpopulated — skip rendering it
  // rather than crashing on cls.category etc.
  if (!cls) return null;
  const category = (cls.category || '').toLowerCase();

  return (
    <div className={`booking-row${cancelled ? ' booking-cancelled' : ''}`}>
      <div className={`booking-category-dot cat-${category}`} />
      <div className="booking-info">
        <div className="booking-name">
          <Link to={`/classes/${cls._id}`}>{cls.name}</Link>
        </div>
        <div className="booking-meta">
          <span className={`badge badge-${category}`}>{cls.category}</span>
          <span>{cls.durationMinutes} min</span>
          <span>{cls.schedule}</span>
          {cls.trainer?.name && <span>with {cls.trainer.name}</span>}
        </div>
      </div>
      <div className="booking-status">
        {cancelled ? (
          <span className="status-cancelled">Cancelled</span>
        ) : (
          <>
            <span className="status-confirmed">Confirmed</span>
            <button
              className="btn-ghost"
              style={{ fontSize: '12px', padding: '5px 12px' }}
              onClick={() => onCancel(booking._id)}
              disabled={cancelling}
            >
              {cancelling ? '...' : 'Cancel'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * MyBookings — the logged-in member's bookings, split into upcoming and
 * cancelled sections.
 *
 * Reads from and dispatches to the Redux bookings slice instead of
 * fetching locally, so a booking made on ClassDetail shows up here
 * without this page needing to know that ClassDetail exists.
 */
function MyBookings() {
  const dispatch = useDispatch();
  const { items: bookings, status, error, cancellingId } = useSelector(
    (state) => state.bookings
  );
  // 'idle' counts as loading too — it's the state before the first fetch
  // has even started, so we don't want to render an empty-state flash.
  const loading = status === 'loading' || status === 'idle';

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchMyBookings());
  };

  const handleCancel = (bookingId) => {
    // .unwrap() rethrows the rejection so we can react to a failed
    // cancel; a simple alert is enough here since this is a rare path.
    dispatch(cancelBooking(bookingId)).unwrap().catch((message) => {
      alert(message || 'Could not cancel booking.');
    });
  };

  const active = bookings.filter((b) => b.status === 'confirmed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          {!loading && !error && (
            <p className="page-sub">
              {active.length} upcoming
            </p>
          )}
        </div>
        <Link
          to="/classes"
          className="btn-primary"
          style={{ padding: '8px 18px', flexShrink: 0 }}
        >
          Book a class
        </Link>
      </div>

      {loading && <LoadingSpinner message="Loading bookings..." />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <p>You haven&apos;t booked any classes yet.</p>
          <Link
            to="/classes"
            className="btn-primary"
            style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px' }}
          >
            Browse classes
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          {active.length > 0 && (
            <section>
              <h2
                className="section-title"
                style={{ marginBottom: '14px' }}
              >
                Upcoming ({active.length})
              </h2>
              <div className="bookings-list">
                {active.map((b) => (
                  <BookingRow
                    key={b._id}
                    booking={b}
                    onCancel={handleCancel}
                    cancelling={cancellingId === b._id}
                    cancelled={false}
                  />
                ))}
              </div>
            </section>
          )}

          {cancelled.length > 0 && (
            <section style={{ marginTop: '36px' }}>
              <h2
                className="section-title"
                style={{ marginBottom: '14px', color: 'var(--text-dim)' }}
              >
                Cancelled ({cancelled.length})
              </h2>
              <div className="bookings-list">
                {cancelled.map((b) => (
                  <BookingRow
                    key={b._id}
                    booking={b}
                    cancelled
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default MyBookings;
