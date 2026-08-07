import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

/**
 * AdminDashboard — admin-only overview: stats, a classes table (with
 * edit/delete), and a recent-bookings table.
 *
 * Uses plain useState/useEffect (not Redux) since this data is only
 * ever read and used on this one page — there's nothing to share.
 */
function AdminDashboard() {
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingClassId, setDeletingClassId] = useState(null);
  const [deletingTrainerId, setDeletingTrainerId] = useState(null);

  // loading starts true; setState only inside async callbacks.
  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/bookings'),
      api.get('/trainers'),
      api.get('/plans'),
    ])
      .then(([cls, bkgs, trn, pln]) => {
        setClasses(cls.data.data);
        setBookings(bkgs.data.data);
        setTrainers(trn.data.data);
        setPlans(pln.data.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load dashboard data')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get('/classes'),
      api.get('/bookings'),
      api.get('/trainers'),
      api.get('/plans'),
    ])
      .then(([cls, bkgs, trn, pln]) => {
        setClasses(cls.data.data);
        setBookings(bkgs.data.data);
        setTrainers(trn.data.data);
        setPlans(pln.data.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load dashboard data')
      )
      .finally(() => setLoading(false));
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    setDeletingClassId(classId);
    try {
      await api.delete(`/classes/${classId}`);
      // Remove it from local state directly instead of re-fetching the
      // whole list — avoids an extra round trip for a one-item change.
      setClasses((prev) => prev.filter((c) => c._id !== classId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete class.');
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleDeleteTrainer = async (trainerId) => {
    if (!window.confirm('Delete this trainer? This cannot be undone.')) return;
    setDeletingTrainerId(trainerId);
    try {
      await api.delete(`/trainers/${trainerId}`);
      setTrainers((prev) => prev.filter((t) => t._id !== trainerId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete trainer.');
    } finally {
      setDeletingTrainerId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error)
    return (
      <div className="page">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );

  // Only confirmed bookings count toward the "Active bookings" stat card.
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <Link
            to="/admin/trainers/new"
            className="btn-primary"
            style={{ padding: '8px 18px' }}
          >
            + New trainer
          </Link>
          <Link
            to="/admin/classes/new"
            className="btn-primary"
            style={{ padding: '8px 18px' }}
          >
            + New class
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{classes.length}</div>
          <div className="admin-stat-label">Classes</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{trainers.length}</div>
          <div className="admin-stat-label">Trainers</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{activeBookings.length}</div>
          <div className="admin-stat-label">Active bookings</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{plans.length}</div>
          <div className="admin-stat-label">Plans</div>
        </div>
      </div>

      {/* Classes table */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Classes</h2>
        </div>
        {classes.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No classes yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Trainer</th>
                  <th>Duration</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>
                      <span
                        className={`badge badge-${(c.category || '').toLowerCase()}`}
                      >
                        {c.category}
                      </span>
                    </td>
                    <td>{c.trainer?.name || '—'}</td>
                    <td>{c.durationMinutes} min</td>
                    <td>{c.schedule}</td>
                    <td className="table-actions">
                      <Link
                        to={`/admin/classes/${c._id}/edit`}
                        className="btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClass(c._id)}
                        disabled={deletingClassId === c._id}
                      >
                        {deletingClassId === c._id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Trainers table */}
      <section style={{ marginTop: '40px' }}>
        <div className="section-header">
          <h2 className="section-title">Trainers</h2>
        </div>
        {trainers.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No trainers yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialties</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.specialties?.join(', ') || '—'}</td>
                    <td>{t.rating != null ? Number(t.rating).toFixed(1) : '—'}</td>
                    <td className="table-actions">
                      <Link
                        to={`/admin/trainers/${t._id}/edit`}
                        className="btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 12px' }}
                      >
                        Edit
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteTrainer(t._id)}
                        disabled={deletingTrainerId === t._id}
                      >
                        {deletingTrainerId === t._id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent bookings table — capped at 20 rows; this is a dashboard
          preview, not a full paginated bookings admin view */}
      <section style={{ marginTop: '40px' }}>
        <div className="section-header">
          <h2 className="section-title">Recent Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No bookings yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Class</th>
                  <th>Category</th>
                  <th>Schedule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 20).map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {b.user?.name || '—'}
                        {b.user?.membership?.plan?.name && (
                          <span className="nav-plan-badge" style={{ fontSize: '10px' }}>
                            {b.user.membership.plan.name}
                          </span>
                        )}
                      </div>
                      <small style={{ color: 'var(--text-mute)' }}>
                        {b.user?.email}
                      </small>
                    </td>
                    <td>{b.class?.name || '—'}</td>
                    <td>
                      {b.class?.category && (
                        <span
                          className={`badge badge-${b.class.category.toLowerCase()}`}
                        >
                          {b.class.category}
                        </span>
                      )}
                    </td>
                    <td>{b.class?.schedule || '—'}</td>
                    <td>
                      <span
                        className={
                          b.status === 'confirmed'
                            ? 'status-confirmed'
                            : 'status-cancelled'
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
