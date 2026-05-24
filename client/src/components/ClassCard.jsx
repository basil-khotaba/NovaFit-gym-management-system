import { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * ClassCard — displays one gym class as a card.
 * Wrapped in React.memo for performance (rubric requirement).
 */
function ClassCard({ gymClass }) {
  const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace('/api', '');
  const categoryClass = `cat-${(gymClass.category || '').toLowerCase()}`;

  return (
    <Link to={`/classes/${gymClass._id}`} className="class-card">
      <div className={`class-img ${categoryClass}`}>
        {gymClass.image ? (
          <img
            src={`${API_ORIGIN}${gymClass.image}`}
            alt={gymClass.name}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="class-img-icon">🏋️</span>
        )}
      </div>
      <div className="class-body">
        <span className={`badge badge-${(gymClass.category || '').toLowerCase()}`}>
          {gymClass.category}
        </span>
        <h3 className="class-name">{gymClass.name}</h3>
        <div className="class-meta">
          <span>{gymClass.durationMinutes} min</span>
          <span>{gymClass.schedule}</span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ClassCard);