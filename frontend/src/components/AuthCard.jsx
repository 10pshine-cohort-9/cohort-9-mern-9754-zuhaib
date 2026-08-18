import { Link } from 'react-router-dom';

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb--peach" aria-hidden="true" />
      <div className="auth-orb auth-orb--lilac" aria-hidden="true" />

      <div className="auth-card glass">
        <p className="brand">Notes</p>
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </div>

      <p className="auth-tagline">
        Your thoughts, one place.{' '}
        <Link to="/" className="text-link">
          Home
        </Link>
      </p>
    </div>
  );
}
