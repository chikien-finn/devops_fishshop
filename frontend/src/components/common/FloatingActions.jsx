import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart.jsx';

export default function FloatingActions() {
  const { totalItems } = useCart();

  return (
    <aside
      aria-label="Kênh hỗ trợ nhanh"
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 999,
      }}
    >
      {/* 1. Giỏ hàng */}
      <Link
        to="/cart"
        title="Xem giỏ hàng"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
          textDecoration: 'none',
          position: 'relative',
          transition: 'transform 0.2s, background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <ShoppingCart size={22} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#facc15',
              color: '#991b1b',
              fontSize: '0.7rem',
              fontWeight: 800,
              borderRadius: '9999px',
              padding: '1px 5px',
              border: '1.5px solid #ffffff',
            }}
          >
            {totalItems}
          </span>
        )}
      </Link>

      {/* 2. Hotline / Điện thoại */}
      <a
        href="tel:0332127582"
        title="Gọi hotline tư vấn: 0332127582"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#e11d48',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)',
          textDecoration: 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Phone size={22} />
      </a>

      {/* 3. Zalo */}
      <a
        href="https://zalo.me/0332127582"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat Zalo hỗ trợ"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: '0.8125rem',
          letterSpacing: '-0.5px',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Zalo
      </a>

      {/* 4. Facebook Messenger */}
      <a
        href="https://m.me/aquacraft"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat Facebook Messenger"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          textDecoration: 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <MessageCircle size={22} />
      </a>
    </aside>
  );
}

