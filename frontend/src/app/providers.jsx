import { AuthProvider } from '../features/auth/hooks/useAuth.jsx';

/**
 * Global application providers wrapper
 */
export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
