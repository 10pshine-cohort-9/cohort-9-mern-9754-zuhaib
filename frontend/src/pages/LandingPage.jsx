import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Public landing page with links to sign up or sign in.
 * @returns {import('react').ReactElement} Landing screen.
 */
export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb--peach" aria-hidden="true" />
      <div className="auth-orb auth-orb--lilac" aria-hidden="true" />

      <div className="home-card glass">
        <p className="brand">Notes</p>
        <h1>Your Thoughts, One Place.</h1>
        <p className="subtitle">
          A calm space for ideas, lists, and collections — starting with secure
          sign-in.
        </p>
        <div className="home-actions">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : isAuthenticated ? (
            <Link className="btn btn-primary" to="/home">
              Go to app
            </Link>
          ) : (
            <>
              <Link className="btn btn-primary" to="/signup">
                Get started
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
