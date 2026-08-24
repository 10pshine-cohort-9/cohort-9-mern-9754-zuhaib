import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../hooks/useAuth';

/**
 * Profile screen showing name, email, and logout. Never shows passwords.
 * @returns {import('react').ReactElement}
 */
export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <p className="brand">Account</p>
        <h1>Profile</h1>
        <section className="profile-card glass">
          <dl className="profile-list">
            <div>
              <dt>Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
          <button className="btn btn-primary" type="button" onClick={logout}>
            Log out
          </button>
        </section>
      </main>
    </div>
  );
}
