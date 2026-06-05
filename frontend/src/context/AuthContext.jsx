import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest } from '../api/auth.ts';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    getMe()
      .then((currentUser) => {
        persistUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem('token');
        persistUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [persistUser]);

  const login = useCallback(async (credentials) => {
    const { token } = await loginRequest(credentials);
    localStorage.setItem('token', token);
    const currentUser = await getMe();
    persistUser(currentUser);
    return currentUser;
  }, [persistUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    persistUser(null);
  }, [persistUser]);

  const value = useMemo(() => ({
    user,
    setUser: persistUser,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isLoading,
    role: user?.role ?? null,
  }), [user, persistUser, login, logout, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
