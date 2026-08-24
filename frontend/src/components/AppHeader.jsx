import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Application header with navigation, user identity, and logout.
 * @returns {import('react').ReactElement}
 */
export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header glass">
      <Link to="/home" className="app-logo">
        Notes
      </Link>
      <nav className="app-nav" aria-label="Main">
        <NavLink to="/home" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          Profile
        </NavLink>
      </nav>
      <div className="app-header-user">
        <span className="header-user-name">{user?.name}</span>
        <Link className="btn btn-primary btn-compact" to="/notes/new">
          New note
        </Link>
        <button className="btn btn-ghost btn-compact" type="button" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
