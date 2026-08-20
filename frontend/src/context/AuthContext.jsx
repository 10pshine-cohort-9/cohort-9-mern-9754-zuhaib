import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginUser, registerUser } from '../services/authApi';

const TOKEN_KEY = 'notes_app_token';

/** @type {import('react').Context<null | Object>} */
export const AuthContext = createContext(null);

/**
 * Provides authentication state and actions to the component tree.
 * @param {{ children: import('react').ReactNode }} props - Child components.
 * @returns {import('react').ReactElement} Context provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  /**
   * Saves the JWT and user profile to state and localStorage.
   * @param {string} nextToken - JWT returned by the API.
   * @param {Object} nextUser - Public user profile.
   */
  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  /**
   * Clears stored credentials and resets auth state.
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    /**
     * Restores the session from a stored token on initial load.
     * @returns {Promise<void>}
     */
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(token);
        if (!cancelled) {
          setUser(response.data.user);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token, clearSession]);

  /**
   * Authenticates a user and stores the returned session.
   * @param {{ email: string, password: string }} credentials - Login payload.
   * @returns {Promise<Object>} Public user profile.
   */
  const login = useCallback(
    async (credentials) => {
      const response = await loginUser(credentials);
      persistSession(response.data.token, response.data.user);
      return response.data.user;
    },
    [persistSession]
  );

  /**
   * Registers a new user and stores the returned session.
   * @param {{ name: string, email: string, password: string }} payload - Registration payload.
   * @returns {Promise<Object>} Public user profile.
   */
  const register = useCallback(
    async (payload) => {
      const response = await registerUser(payload);
      persistSession(response.data.token, response.data.user);
      return response.data.user;
    },
    [persistSession]
  );

  /**
   * Ends the current session and removes the stored token.
   */
  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
