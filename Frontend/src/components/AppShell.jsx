'use client';

import { useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isReady } = useContext(AuthContext);
  const isLogin = pathname === '/login';

  useEffect(() => {
    if (!isReady) return;

    if (!isLogin && !token) {
      router.replace('/login');
      return;
    }

    if (isLogin && token) {
      router.replace('/dashboard');
    }
  }, [isReady, isLogin, token, router]);

  if (!isReady) return null;
  if (isLogin) return children;
  if (!token) return null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          <header className="topbar">
            <span className="crumb">Atelier / espace de gestion</span>
            <div className="topbar-actions">
              <button className="icon-button" aria-label="Notifications">♡</button>
              <div className="avatar" aria-label="Compte artisan">HB</div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
