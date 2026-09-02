import './globals.css';
import AppShell from '../components/AppShell';
import AuthProvider from '../context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
