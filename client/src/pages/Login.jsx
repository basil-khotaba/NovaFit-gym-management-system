import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">NOVA<span>FIT</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {serverError && <div className="auth-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/register">Join now</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
