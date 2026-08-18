import { Link } from 'react-router-dom';

/**
 * Glass-style card wrapper for login and signup screens.
 * @param {{ title: string, subtitle?: string, children: import('react').ReactNode, footer?: import('react').ReactNode }} props - Card content props.
 * @returns {import('react').ReactElement} Styled authentication card.
 */
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
