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
    if (existing) {
      const maxStock = typeof existing.stock === 'number' ? existing.stock : Infinity;
      existing.quantity = Math.min(maxStock, (existing.quantity || 1) + (item.quantity || 1));
    } else if (item._id) {
      const maxStock = typeof item.stock === 'number' ? item.stock : Infinity;
      merged.set(key, { ...item, quantity: Math.min(maxStock, item.quantity || 1) });
    }
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
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCart)); } catch {}
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* Storage may be unavailable. */
    }
    if (!isAuthenticated) {
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
      const maxStock = typeof product.stock === 'number'
        ? Math.max(0, product.stock)
        : (typeof existing?.stock === 'number' ? Math.max(0, existing.stock) : Infinity);

      if (maxStock <= 0) return previous;

      if (existing) {
        const itemStock = typeof existing.stock === 'number' ? existing.stock : maxStock;
        const currentQty = existing.quantity || 1;
        const newQty = Math.min(itemStock, currentQty + Math.max(1, quantity));
        return previous.map((item) => String(item._id || item.id) === String(productId)
          ? { ...item, ...product, stock: itemStock, quantity: newQty }
          : item);
      }
      const initialQty = Math.max(1, Math.min(quantity, maxStock));
      return [...previous, { ...product, stock: maxStock, quantity: initialQty }];
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
    setCart((previous) => previous.map((item) => {
      if (String(item._id || item.id) === String(productId)) {
        const maxStock = typeof item.stock === 'number' ? Math.max(1, item.stock) : Infinity;
        const clampedQty = Math.min(maxStock, Math.max(1, quantity));
        return { ...item, quantity: clampedQty };
      }
      return item;
    }));
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
