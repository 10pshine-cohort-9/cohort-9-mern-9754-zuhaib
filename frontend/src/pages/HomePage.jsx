import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb--peach" aria-hidden="true" />
      <div className="auth-orb auth-orb--lilac" aria-hidden="true" />

      <div className="home-card glass">
        <p className="brand">Notes</p>
        <h1>Your Thoughts, One Place.</h1>
        <p className="subtitle">
          Signed in as <strong>{user?.name}</strong> ({user?.email}).
        </p>
        <p className="muted">
          Notes features will land in a later PR. Auth is ready.
        </p>
        <div className="home-actions">
          <button className="btn btn-primary" type="button" onClick={logout}>
            Log out
          </button>
          <Link className="btn btn-ghost" to="/login">
            Auth pages
          </Link>
        </div>
      </div>
    </div>
  );
}
