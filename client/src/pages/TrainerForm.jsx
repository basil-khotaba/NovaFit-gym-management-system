import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Images are served from the API's origin, not the '/api' path.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const EMPTY_FORM = {
  name: '',
  bio: '',
  specialties: '',
  rating: 0,
};

/**
 * TrainerForm — admin page for creating or editing a trainer.
 *
 * Same create/edit-in-one-component pattern as ClassForm: isEdit is
 * derived from whether a route param (:id) is present. The photo is
 * uploaded separately from the text fields, since the upload endpoint
 * needs a trainer id to attach to — in create mode that means saving
 * the trainer first, then uploading the photo against the new id.
 */
function TrainerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingPhoto, setExistingPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    api
      .get(`/trainers/${id}`)
      .then((res) => {
        const t = res.data.data;
        setForm({
          name: t.name,
          bio: t.bio || '',
          // specialties is stored as an array; the form edits it as a
          // single comma-separated string, split back apart on submit.
          specialties: (t.specialties || []).join(', '),
          rating: t.rating ?? 0,
        });
        setExistingPhoto(t.photo || '');
      })
      .catch(() => setError('Could not load trainer data.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Revoke the local preview URL when it changes or the component
  // unmounts, so we don't leak object URLs.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        specialties: form.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        rating: Number(form.rating),
      };

      let trainerId = id;
      if (isEdit) {
        await api.put(`/trainers/${id}`, payload);
      } else {
        const res = await api.post('/trainers', payload);
        trainerId = res.data.data._id;
      }

      // Photo upload is a separate multipart request against the
      // trainer id we now have (existing or newly created).
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await api.patch(`/trainers/${trainerId}/photo`, formData);
      }

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save trainer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading trainer..." />;

  const previewSrc = photoPreview || (existingPhoto ? `${API_ORIGIN}${existingPhoto}` : '');

  return (
    <div className="page">
      <Link to="/admin" className="back-link">← Back to dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '16px', marginBottom: '24px' }}>
        {isEdit ? 'Edit Trainer' : 'New Trainer'}
      </h1>

      {error && (
        <div className="auth-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label>Trainer name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Dani Torres"
              required
            />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <input
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              min={0}
              max={5}
              step={0.1}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Brief bio for this trainer..."
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label>Specialties</label>
          <input
            type="text"
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            placeholder="e.g. Yoga, Meditation, Mobility (comma-separated)"
          />
        </div>

        <div className="form-group">
          <label>Photo</label>
          {previewSrc && (
            <img
              src={previewSrc}
              alt="Trainer preview"
              style={{
                width: '96px',
                height: '96px',
                objectFit: 'cover',
                borderRadius: '50%',
                marginBottom: '10px',
                display: 'block',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="form-actions">
          <Link to="/admin" className="btn-ghost">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? 'Saving...'
              : isEdit
              ? 'Save changes'
              : 'Create trainer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TrainerForm;
