import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { useAuth } from '../hooks/useAuth';

/**
 * Registration form that creates a new user account.
 * @returns {import('react').ReactElement} Signup screen.
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  /**
   * Submits registration data to the auth API.
   * @param {import('react').FormEvent<HTMLFormElement>} event - Form submit event.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({ name, email, password });
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Start capturing your thoughts in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-link">
            Sign in
          </Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error ? <div className="form-alert">{error}</div> : null}

        <label className="field">
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            minLength={2}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
