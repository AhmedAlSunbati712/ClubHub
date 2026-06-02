import { createContext, useContext, useState } from 'react';
import { currentUser } from '../data/fixtures.js';

const AuthContext = createContext(null);

/**
 * Holds the current user and role (Member / Officer / President / Admin).
 * TODO: replace the placeholder fixture user with real auth wiring.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(currentUser); // { id, name, email, role, clubRoles }

  const value = {
    user,
    setUser,
    isAuthenticated: Boolean(user),
    role: user?.role ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
