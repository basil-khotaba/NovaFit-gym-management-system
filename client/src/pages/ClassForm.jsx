import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Strength', 'Cardio', 'Yoga', 'HIIT'];

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'Strength',
  durationMinutes: 60,
  schedule: '',
  capacity: 20,
  trainer: '',
};

/**
 * ClassForm — admin page for creating or editing a gym class.
 *
 * One component handles both modes: isEdit is derived from whether a
 * route param (:id) is present. /admin/classes/new has no id → create
 * mode; /admin/classes/:id/edit has one → edit mode, which pre-fills
 * the form from the existing class.
 */
function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [trainers, setTrainers] = useState([]);
  // Only show the loading spinner in edit mode — create mode has nothing
  // to fetch before the form is usable (trainers list loads in the background).
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/trainers').then((res) => {
      const list = res.data.data;
      setTrainers(list);
      // In create mode, default the trainer dropdown to the first option
      // rather than leaving it blank/unselected.
      if (!isEdit && list.length > 0) {
        setForm((prev) => ({ ...prev, trainer: list[0]._id }));
      }
    });

    if (isEdit) {
      api
        .get(`/classes/${id}`)
        .then((res) => {
          const c = res.data.data;
          // Map the fetched class onto the form shape. trainer may come
          // back populated (an object with _id) or as a raw id string,
          // depending on the endpoint — handle both.
          setForm({
            name: c.name,
            description: c.description || '',
            category: c.category,
            durationMinutes: c.durationMinutes,
            schedule: c.schedule,
            capacity: c.capacity,
            trainer: c.trainer?._id || c.trainer || '',
          });
        })
        .catch(() => setError('Could not load class data.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Same form data, different verb/endpoint depending on the mode.
      if (isEdit) {
        await api.put(`/classes/${id}`, form);
      } else {
        await api.post('/classes', form);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save class.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading class..." />;

  return (
    <div className="page">
      <Link to="/admin" className="back-link">← Back to dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '16px', marginBottom: '24px' }}>
        {isEdit ? 'Edit Class' : 'New Class'}
      </h1>

      {error && (
        <div className="auth-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label>Class name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Morning HIIT Blast"
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of what this class involves..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              value={form.durationMinutes}
              onChange={handleChange}
              min={5}
              max={240}
              required
            />
          </div>
          <div className="form-group">
            <label>Capacity (spots)</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min={1}
              max={500}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Schedule</label>
            <input
              type="text"
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              placeholder="e.g. Mon / Wed / Fri — 7:00 AM"
              required
            />
          </div>
          <div className="form-group">
            <label>Trainer</label>
            <select
              name="trainer"
              value={form.trainer}
              onChange={handleChange}
              required
            >
              {trainers.length === 0 && (
                <option value="">No trainers — add one first</option>
              )}
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Link to="/admin" className="btn-ghost">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? 'Saving...'
              : isEdit
              ? 'Save changes'
              : 'Create class'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClassForm;
