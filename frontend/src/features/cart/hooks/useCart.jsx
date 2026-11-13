import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import cartService from '../services/cartService.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'aquacraft_cart';

const readGuestCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const mergeCartItems = (serverItems, guestItems) => {
  const merged = new Map(serverItems.map((item) => [String(item._id), { ...item }]));
  guestItems.forEach((item) => {
    const key = String(item._id || item.id || '');
    if (!key) return;
    const existing = merged.get(key);
    if (existing) existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    else if (item._id) merged.set(key, { ...item, quantity: item.quantity || 1 });
  });
  return [...merged.values()];
};

export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [serverSyncEnabled, setServerSyncEnabled] = useState(false);
  const [syncError, setSyncError] = useState('');
  const syncQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;
    setReady(false);
    setServerSyncEnabled(false);
    setSyncError('');

    if (!isAuthenticated) {
      setCart(readGuestCart());
      setReady(true);
      return () => { cancelled = true; };
    }

    const initializeUserCart = async () => {
      const guestCart = readGuestCart();
      let serverCart = [];
      let serverCartLoaded = false;
      try {
        serverCart = await cartService.getCart();
        serverCartLoaded = true;
      } catch (error) {
        if (!cancelled) setSyncError(error.response?.data?.message || 'Không thể tải giỏ hàng từ máy chủ.');
      }
      if (cancelled) return;
      if (!serverCartLoaded) {
        setCart(guestCart);
        setReady(true);
        return;
      }

      const mergedCart = mergeCartItems(serverCart, guestCart);
      setCart(mergedCart);
      try {
        const savedCart = await cartService.syncCart(mergedCart);
        if (cancelled) return;
        setCart(savedCart);
        localStorage.removeItem(STORAGE_KEY);
        setSyncError('');
      } catch (error) {
        if (!cancelled) setSyncError(error.response?.data?.message || 'Giỏ hàng chưa đồng bộ được với máy chủ.');
      } finally {
        if (!cancelled) {
          setServerSyncEnabled(true);
          setReady(true);
        }
      }
    };

    initializeUserCart();
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, user?._id, user?.id]);

  useEffect(() => {
    if (!ready) return undefined;
    if (!isAuthenticated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* Storage may be unavailable. */ }
      return undefined;
    }
    if (!serverSyncEnabled) return undefined;

    const timer = window.setTimeout(() => {
      const snapshot = cart;
      syncQueue.current = syncQueue.current
        .catch(() => {})
        .then(() => cartService.syncCart(snapshot))
        .then(() => setSyncError(''))
        .catch((error) => setSyncError(error.response?.data?.message || 'Giỏ hàng chưa đồng bộ được với máy chủ.'));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [cart, isAuthenticated, ready, serverSyncEnabled]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((previous) => {
      const productId = product._id || product.id;
      const existing = previous.find((item) => String(item._id || item.id) === String(productId));
      if (existing) {
        return previous.map((item) => String(item._id || item.id) === String(productId)
          ? { ...item, quantity: (item.quantity || 1) + quantity }
          : item);
      }
      return [...previous, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((previous) => previous.filter((item) => String(item._id || item.id) !== String(productId)));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((previous) => previous.map((item) => String(item._id || item.id) === String(productId)
      ? { ...item, quantity }
      : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount, syncError, cartReady: ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
