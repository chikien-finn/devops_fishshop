import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, MessageCircle } from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart.jsx';

export default function FloatingActions() {
  const { totalItems } = useCart();

  const buttonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    textDecoration: 'none',
    position: 'relative',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#f8fafc';
    e.currentTarget.style.borderColor = '#cbd5e1';
    e.currentTarget.style.color = '#0284c7';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#ffffff';
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.color = '#334155';
  };

  return (
    <aside
      aria-label="Kênh hỗ trợ nhanh"
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 999,
      }}
    >
      {/* 1. Giỏ hàng */}
      <Link
        to="/cart"
        title="Xem giỏ hàng"
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ShoppingCart size={18} strokeWidth={1.75} />
        {totalItems > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              border: '2px solid #ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {totalItems}
          </span>
        )}
      </Link>

      {/* 2. Hotline */}
      <a
        href="tel:0332127582"
        title="Hotline: 0332 127 582"
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Phone size={18} strokeWidth={1.75} />
      </a>

      {/* 3. Zalo */}
      <a
        href="https://zalo.me/0332127582"
        target="_blank"
        rel="noopener noreferrer"
        title="Tư vấn qua Zalo"
        style={{
          ...buttonStyle,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Zalo
      </a>

      {/* 4. Messenger */}
      <a
        href="https://m.me/aquacraft"
        target="_blank"
        rel="noopener noreferrer"
        title="Hỗ trợ Facebook Messenger"
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MessageCircle size={18} strokeWidth={1.75} />
      </a>
    </aside>
  );
}
