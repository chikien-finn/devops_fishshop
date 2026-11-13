import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../hooks/useCart.jsx';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import orderService from '../../orders/services/orderService.js';
import { formatCurrency } from '../../../utils/formatters.js';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems, syncError } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentConfigError, setPaymentConfigError] = useState('');
  const [shippingRegion, setShippingRegion] = useState('central');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const shippingFees = { north: 35000, central: 25000, south: 30000 };
  const shippingFee = shippingFees[shippingRegion];
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const checkoutTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

  const handleApplyCoupon = async () => {
    setCouponMessage('');
    try {
      const coupon = await orderService.validateCoupon(couponInput, totalAmount);
      setAppliedCoupon(coupon);
      setCouponInput(coupon.code);
      setCouponMessage(`Đã áp dụng mã ${coupon.code}`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMessage(err.response?.data?.message || 'Không thể áp dụng mã giảm giá');
    }
  };

  useEffect(() => {
    if (user) {
      if (!shippingAddress && user.address) setShippingAddress(user.address);
      if (!phoneNumber && user.phone) setPhoneNumber(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (paymentMethod !== 'banking') return;
    let active = true;
    orderService.getPaymentConfig()
      .then((config) => { if (active) { setPaymentConfig(config); setPaymentConfigError(''); } })
      .catch(() => { if (active) setPaymentConfigError('Chưa tải được thông tin ngân hàng nhận tiền.'); });
    return () => { active = false; };
  }, [paymentMethod]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated) {
      setErrorMsg('Vui lòng đăng nhập để tiến hành đặt hàng và lưu lịch sử đơn hàng.');
      return;
    }
    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ giao hàng và số điện thoại.');
      return;
    }

    if (paymentMethod === 'banking' && !paymentConfig) {
      setErrorMsg(paymentConfigError || 'Đang tải thông tin chuyển khoản. Vui lòng thử lại sau ít giây.');
      return;
    }

    try {
      setSubmitting(true);
      const items = cart.map((item) => ({
        product: item._id || item.id,
        slug: item.slug,
        name: item.name,
        quantity: item.quantity || 1,
      }));
      const order = await orderService.createOrder({
        shippingAddress: shippingAddress.trim(),
        phoneNumber: phoneNumber.trim(),
        paymentMethod,
        shippingRegion,
        couponCode: appliedCoupon?.code || '',
        items,
      });
      setCreatedOrder(order);
      clearCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    const transferContent = `AQUA${createdOrder._id?.slice(-8).toUpperCase()}`;
    const qrUrl = createdOrder.paymentMethod === 'banking' && paymentConfig?.bankBin && paymentConfig?.accountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(paymentConfig.bankBin)}-${encodeURIComponent(paymentConfig.accountNumber)}-compact2.svg?amount=${encodeURIComponent(createdOrder.totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(paymentConfig.accountName || '')}`
      : '';
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          padding: '3rem 2rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.08)',
        }}
      >
        <CheckCircle size={56} color="#059669" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Đặt hàng thành công!
        </h2>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          Mã đơn hàng của bạn: <strong>#{createdOrder._id?.slice(-6).toUpperCase()}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Tổng thanh toán: <strong style={{ color: '#dc2626' }}>{formatCurrency(createdOrder.totalAmount)}</strong>. Trại cá AquaCraft sẽ đóng oxy và giao hàng trong 24-48h!
        </p>
        {createdOrder.paymentMethod === 'banking' && (
          <div className="checkout-bank-payment">
            <h3>Quét QR để chuyển khoản</h3>
            {qrUrl ? <img src={qrUrl} alt={`Mã QR chuyển khoản ${paymentConfig?.bankName || ''}`} /> : <p>{paymentConfigError || 'Đang tải mã QR…'}</p>}
            {paymentConfig && <div><strong>{paymentConfig.bankName} · {paymentConfig.accountNumber}</strong><span>{paymentConfig.accountName}</span><span>Số tiền: {formatCurrency(createdOrder.totalAmount)}</span><span>Nội dung: <b>{transferContent}</b></span></div>}
            <p>Trạng thái thanh toán: <strong>Chờ cửa hàng xác nhận</strong>. Đơn hàng chỉ được cập nhật sau khi đối soát chuyển khoản.</p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.625rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ShoppingBag size={16} /> Xem lịch sử đơn hàng
          </Link>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.625rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.625rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ShoppingBag size={16} /> Xem lịch sử đơn hàng
          </Link>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.625rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>
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
            <span>Phí vận chuyển:</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatCurrency(shippingFee)}</span>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Khu vực giao hàng</label>
            <select value={shippingRegion} onChange={(e) => setShippingRegion(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
              <option value="north">Miền Bắc · 35.000đ</option>
              <option value="central">Miền Trung · 25.000đ</option>
              <option value="south">Miền Nam · 30.000đ</option>
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Mã giảm giá</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input value={couponInput} onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setAppliedCoupon(null); setCouponMessage(''); }} placeholder="Nhập mã voucher" style={{ minWidth: 0, flex: 1, padding: '0.5rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              <button type="button" onClick={handleApplyCoupon} style={{ padding: '0.5rem 0.7rem', border: '1px solid #0284c7', color: '#0284c7', borderRadius: '6px', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Áp dụng</button>
            </div>
            {couponMessage && <p style={{ margin: '0.35rem 0 0', color: appliedCoupon ? '#059669' : '#dc2626', fontSize: '0.75rem' }}>{couponMessage}</p>}
          </div>

          {discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontSize: '0.875rem', marginBottom: '0.75rem' }}><span>Giảm giá ({appliedCoupon.code}):</span><strong>-{formatCurrency(discountAmount)}</strong></div>}

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
            <span style={{ color: '#dc2626' }}>{formatCurrency(checkoutTotal)}</span>
          </div>

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Số điện thoại nhận hàng *
              </label>
              <input
                type="tel"
                required
                placeholder="0901234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Địa chỉ giao hàng *
              </label>
              <input
                type="text"
                required
                placeholder="Số nhà, tên đường, Quận/Huyện..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="banking">Chuyển khoản ngân hàng / QR</option>
              </select>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '0.8rem' }}>
                {errorMsg}{' '}
                {!isAuthenticated && (
                  <Link to="/login" style={{ fontWeight: 700, color: '#0284c7', textDecoration: 'underline' }}>
                    Đăng nhập ngay
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: submitting ? '#94a3b8' : '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              <CheckCircle size={18} /> {submitting ? 'Đang xử lý...' : 'Tiến Hành Đặt Hàng'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
