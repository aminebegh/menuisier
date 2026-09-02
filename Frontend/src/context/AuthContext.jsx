'use client';

import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    setToken(storedToken);
    setIsReady(true);
  }, []);

  const signIn = (nextToken) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('token', nextToken);
    }
    setToken(nextToken);
  };

  const signOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
    }
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
