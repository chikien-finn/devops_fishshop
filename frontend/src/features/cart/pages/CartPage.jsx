import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart.jsx';
import { formatCurrency } from '../../../utils/formatters.js';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          padding: '3rem 2rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <ShoppingBag size={56} color="#94a3b8" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Giỏ hàng của bạn đang trống
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Hãy khám phá các giống cá cảnh tuyệt đẹp và phụ kiện tại AquaCraft ngay!
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '0.625rem 1.25rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={16} /> Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag color="#dc2626" />
          <span>Giỏ Hàng Của Bạn ({totalItems} món)</span>
        </h1>

        <button
          onClick={clearCart}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Trash2 size={14} /> Xóa tất cả
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(260px, 1fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Cart Item List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <img
                src={item.images?.[0] || '/logo.png'}
                alt={item.name}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  backgroundColor: '#f1f5f9',
                }}
              />

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {item.name}
                </h4>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626' }}>
                  {formatCurrency(item.price)}
                </span>
              </div>

              {/* Quantity Adjuster */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <Minus size={13} />
                </button>
                <span
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ minWidth: '90px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item._id)}
                title="Xóa món này"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Tóm Tắt Đơn Hàng
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '0.75rem',
            }}
          >
            <span>Tổng tiền hàng:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(totalAmount)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              color: '#64748b',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span>Phí vận chuyển (Oxy 48h):</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Miễn phí</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1.5rem',
            }}
          >
            <span>Thành tiền:</span>
            <span style={{ color: '#dc2626' }}>{formatCurrency(totalAmount)}</span>
          </div>

          <button
            onClick={() => alert(`Đặt hàng thành công! Đơn hàng trị giá ${formatCurrency(totalAmount)} sẽ được giao trong 24-48h.`)}
            style={{
              width: '100%',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={18} /> Tiến Hành Đặt Hàng
          </button>
        </div>
      </div>
    </div>
  );
}
