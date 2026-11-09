import { AuthProvider } from '../features/auth/hooks/useAuth.jsx';
import { CartProvider } from '../features/cart/hooks/useCart.jsx';

/**
 * Global application providers wrapper
 */
export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
