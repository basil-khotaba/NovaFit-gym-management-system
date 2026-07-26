import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">NOVA<span>FIT</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start your fitness journey today</p>

        {serverError && <div className="auth-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

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
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === getValues('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
