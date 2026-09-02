'use client';

import Link from 'next/link';
import { ClipboardList, FileText, LayoutDashboard, Package, WalletCards } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const navigation = [
  { href: '/dashboard', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { href: '/commandes', label: 'Commandes', icon: ClipboardList },
  { href: '/depenses', label: 'Achats & matériaux', icon: Package },
  { href: '/bilan', label: 'Bilan financier', icon: WalletCards },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useContext(AuthContext);

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-mark">
          <div className="brand-logo">🪵</div>
          <div className="brand-copy">
            <span>Menuiserie</span>
            <strong>Hadj Beghernaout</strong>
          </div>
        </div>
      </div>

      <div className="profile-box">
        <div className="profile-avatar">HB</div>
        <div className="profile-meta">
          <strong>Hadj Beghernaout</strong>
          <span>Compte propriétaire</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        <div className="nav-group">
          <p className="nav-title">Navigation</p>

          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? 'active' : ''}`}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '42px',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '10px',
                  background: active ? '#bd8c6b' : 'transparent',
                  color: active ? '#fff' : '#1f1b1a',
                  textDecoration: 'none',
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease'
                }}
              >
                <span className="nav-icon">
                  <Icon size={17} />
                </span>
                <span className="nav-label">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="nav-group nav-group-spaced">
          <p className="nav-title">Actions</p>

          <Link 
            href="/commandes/nouvelle" 
            className="nav-item action-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '42px',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              color: '#1f1b1a',
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
          >
            <span className="nav-icon">
              <FileText size={17} />
            </span>
            <span className="nav-label">Nouvelle commande</span>
          </Link>

          <button 
            type="button" 
            className="logout-nav-button" 
            onClick={handleSignOut} 
            aria-label="Déconnexion"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '42px',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '10px',
              background: '#b56c64',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s ease, transform 0.2s ease',
              width: '100%',
              textAlign: 'left',
              font: 'inherit'
            }}
            onMouseEnter={(e) => e.target.style.background = '#9d4d47'}
            onMouseLeave={(e) => e.target.style.background = '#b56c64'}
          >
            <span className="nav-label">Déconnexion</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .sidebar {
          width: 260px;
          flex: 0 0 260px;
          min-height: 100vh;
          background: rgba(247, 242, 237, 0.95);
          border-right: 1px solid #e8ddd2;
          display: flex;
          flex-direction: column;
          padding-bottom: 18px;
        }

        .sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid #e8ddd2;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #bd8c6b 0%, #7a5646 100%);
          display: grid;
          place-items: center;
          font-size: 22px;
          box-shadow: 0 8px 18px rgba(122, 86, 70, 0.18);
        }

        .brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .brand-copy span {
          color: #7a6d65;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .brand-copy strong {
          color: #1e1a18;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        .profile-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          margin: 16px 14px 0;
          border: 1px solid #e8ddd2;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.5);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #1f1b1a 0%, #4b3f3a 100%);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
        }

        .profile-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .profile-meta strong {
          color: #1f1b1a;
          font-size: 12px;
          font-weight: 700;
        }

        .profile-meta span {
          color: #7a6d65;
          font-size: 10px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          padding: 18px 14px 0;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-group-spaced {
          margin-top: 28px;
        }

        .nav-title {
          margin: 0 0 8px 0;
          color: #7a6d65;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding-left: 8px;
        }

        .nav-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          min-width: 16px;
          color: inherit;
          flex-shrink: 0;
        }

        .nav-label {
          display: inline-flex;
          align-items: center;
          font-size: 15px;
          line-height: 1.2;
          white-space: nowrap;
          flex: 1;
        }

        .logout-button {
          align-self: flex-start;
          margin: 10px 0 0 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .logout-avatar {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #191716;
          color: #f8f2ee;
          font-size: 22px;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(25, 23, 22, 0.18);
          transition: background 0.2s ease;
        }

        .logout-button:hover .logout-avatar {
          background: #bd8c6b;
        }

        @media (max-width: 720px) {
          .sidebar {
            width: 100%;
            flex-basis: auto;
            min-height: auto;
            border-right: 0;
            border-bottom: 1px solid #e8ddd2;
          }

          .sidebar-header, .profile-box, .sidebar-nav {
            padding-left: 12px;
            padding-right: 12px;
          }

          .logout-button {
            margin-left: 12px;
          }
        }
      `}</style>
    </aside>
  );
}