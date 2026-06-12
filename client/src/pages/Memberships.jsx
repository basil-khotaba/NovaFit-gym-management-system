import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

function PlanCard({ plan, onSelect, selecting, isLoggedIn, isCurrent }) {
  const featured = plan.featured;

  return (
    <div className={`plan-card${featured ? ' plan-featured' : ''}${isCurrent ? ' plan-current' : ''}`}>
      {isCurrent && <div className="plan-badge plan-badge-current">Your Plan</div>}
      {!isCurrent && featured && <div className="plan-badge">Popular</div>}
      <div className="plan-name">{plan.name}</div>
      <div className="plan-price">
        <span className="plan-price-amount">${plan.price}</span>
        <span className="plan-price-period">/month</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
        {plan.classLimit ? `${plan.classLimit} classes/month` : 'Unlimited classes/month'}
      </div>
      <ul className="plan-features">
        {plan.features?.map((f, i) => (
          <li key={i}>
            <span className="check">✓</span> {f}
          </li>
        ))}
      </ul>
      {isLoggedIn ? (
        <button
          className={`${featured || isCurrent ? 'btn-primary' : 'btn-ghost'} plan-btn`}
          onClick={() => onSelect(plan._id, plan.name)}
          disabled={selecting || isCurrent}
        >
          {isCurrent ? 'Active' : selecting ? 'Processing...' : 'Get started'}
        </button>
      ) : (
        <Link
          to="/login"
          className={`${featured ? 'btn-primary' : 'btn-ghost'} plan-btn`}
        >
          Get started
        </Link>
      )}
    </div>
  );
}

function Memberships() {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectingId, setSelectingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [planError, setPlanError] = useState(null);

  // The plan the user currently has — comes from user.membership.plan._id
  const currentPlanId = user?.membership?.plan?._id?.toString()
    ?? user?.membership?.plan?.toString()
    ?? null;

  useEffect(() => {
    api
      .get('/plans')
      .then((res) => setPlans(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load plans')
      )
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    api
      .get('/plans')
      .then((res) => setPlans(res.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load plans')
      )
      .finally(() => setLoading(false));
  };

  const handleSelect = (planId, planName) => {
    setSelectingId(planId);
    setPlanError(null);
    setSuccessMsg(null);
    api
      .patch('/auth/me/plan', { plan: planId })
      .then((res) => {
        // Update the user in context so the current-plan highlight updates immediately
        updateUser({ ...user, membership: res.data.data });
        setSuccessMsg(`Your membership plan has been changed to ${planName}!`);
      })
      .catch((err) =>
        setPlanError(err.response?.data?.message || 'Could not activate plan.')
      )
      .finally(() => setSelectingId(null));
  };

  return (
    <div className="page">
      <div
        className="page-header"
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '40px',
        }}
      >
        <h1 className="page-title">Membership Plans</h1>
        <p className="page-sub">
          Choose the plan that fits your goals. Cancel anytime.
        </p>
        {user && currentPlanId && (
          <p style={{ marginTop: '10px', color: 'var(--text-dim)', fontSize: '14px' }}>
            Current plan:{' '}
            <span style={{ color: 'var(--red)', fontWeight: 600 }}>
              {plans.find((p) => p._id === currentPlanId)?.name ?? 'Loading…'}
            </span>
          </p>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading plans..." />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {successMsg && (
        <div
          className="booking-msg success"
          style={{ maxWidth: '500px', margin: '0 auto 28px', textAlign: 'center' }}
        >
          {successMsg}
        </div>
      )}
      {planError && (
        <div
          className="booking-msg error"
          style={{ maxWidth: '500px', margin: '0 auto 28px', textAlign: 'center' }}
        >
          {planError}
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="empty-state">
          <p>No membership plans available yet.</p>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <div className="plans-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onSelect={handleSelect}
              selecting={selectingId === plan._id}
              isLoggedIn={Boolean(user)}
              isCurrent={plan._id === currentPlanId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Memberships;
