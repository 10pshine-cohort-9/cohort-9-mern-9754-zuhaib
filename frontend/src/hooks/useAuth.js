import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Reads authentication state and actions from AuthContext.
 * @returns {Object} Current auth session and helper methods.
 * @throws {Error} When used outside of AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
