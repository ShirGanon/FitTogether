// Provides the logged-in user to any component in the tree without prop-drilling.
// On first load it calls GET /api/auth/me to restore session from the cookie.

import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
