import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../hooks/useCart.jsx';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import orderService from '../../orders/services/orderService.js';
import { formatCurrency, formatOrderCode } from '../../../utils/formatters.js';
import AddressDropdownSelector from '../../../components/common/AddressDropdownSelector.jsx';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems, syncError } = useCart();
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [transferred, setTransferred] = useState(false);
  const [copiedField, setCopiedField] = useState('');
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

  const handleCopy = (text, fieldName) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2500);
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

    const cleanAddress = shippingAddress.trim();
    if (cleanAddress.length < 5 || cleanAddress.length > 200) {
      setErrorMsg('Địa chỉ giao hàng phải từ 5 đến 200 ký tự.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setErrorMsg('Số điện thoại nhận hàng phải từ 10 đến 11 chữ số.');
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
      const cleanAddress = shippingAddress.trim();
      const cleanPhone = phoneNumber.trim();
      const order = await orderService.createOrder({
        shippingAddress: cleanAddress,
        phoneNumber: cleanPhone,
        paymentMethod,
        shippingRegion,
        couponCode: appliedCoupon?.code || '',
        items,
      });

      // Tự động lưu địa chỉ & số điện thoại mua gần nhất vào tài khoản người dùng
      if (user && updateProfile) {
        updateProfile({
          name: user.name,
          phone: cleanPhone,
          address: cleanAddress,
        }).catch(() => {});
      }

      setCreatedOrder(order);
      clearCart();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdOrder) {
    const orderCode = formatOrderCode(createdOrder._id);

    if (createdOrder.paymentMethod === 'cod') {
      return (
        <div
          style={{
            maxWidth: '600px',
            margin: '3rem auto',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            padding: '3rem 2rem',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
          }}
        >
          <CheckCircle size={56} color="#059669" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: '999px',
              marginBottom: '0.75rem',
              border: '1px solid #a7f3d0',
            }}
          >
            ✓ ĐẶT HÀNG THÀNH CÔNG (COD)
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Đặt hàng thành công!
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Mã đơn hàng của bạn: <strong>#{orderCode}</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Tổng thanh toán: <strong style={{ color: '#dc2626' }}>{formatCurrency(createdOrder.totalAmount)}</strong> (Thanh toán khi nhận hàng).<br />
            Trại cá AquaCraft đã tiếp nhận đơn hàng, nhân viên sẽ đóng oxy và giao hàng trong 24-48h!
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

    // Trường hợp Banking (Chuyển khoản VietQR)
    const transferContent = `AQUA${orderCode}`;
    const qrUrl = createdOrder.paymentMethod === 'banking' && paymentConfig?.bankBin && paymentConfig?.accountNumber
      ? `https://img.vietqr.io/image/${encodeURIComponent(paymentConfig.bankBin)}-${encodeURIComponent(paymentConfig.accountNumber)}-compact2.svg?amount=${encodeURIComponent(createdOrder.totalAmount)}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(paymentConfig.accountName || '')}`
      : '';

    // Nếu khách hàng đã bấm "Tôi đã chuyển khoản xong"
    if (transferred) {
      return (
        <div
          style={{
            maxWidth: '600px',
            margin: '3rem auto',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            padding: '3rem 2rem',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
          }}
        >
          <CheckCircle size={56} color="#059669" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <div
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: '999px',
              marginBottom: '0.75rem',
              border: '1px solid #a7f3d0',
            }}
          >
            ✓ ĐÃ GHI NHẬN THÔNG BÁO CHUYỂN KHOẢN
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Đã ghi nhận chuyển khoản!
          </h2>
          <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Mã đơn hàng của bạn: <strong>#{orderCode}</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Hệ thống đang đối soát khoản chuyển <strong style={{ color: '#dc2626' }}>{formatCurrency(createdOrder.totalAmount)}</strong> của bạn.<br />
            Ngay khi tiền về tài khoản, trại cá AquaCraft sẽ tiến hành đóng oxy và giao hàng trong 24-48h!
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

    // Nếu chưa bấm "Tôi đã chuyển khoản xong" -> Hiển thị màn hình Chờ thanh toán VietQR
    return (
      <div
        style={{
          maxWidth: '640px',
          margin: '2rem auto',
          backgroundColor: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.08)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Clock size={36} color="#0284c7" />
        </div>

        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '6px',
            marginBottom: '0.75rem',
            border: '1px solid #fde68a',
          }}
        >
          Đơn hàng đã tạo - Chờ chuyển khoản
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
          Vui lòng thanh toán đơn hàng
        </h2>
        <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Mã đơn hàng của bạn: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>#{orderCode}</strong>
        </p>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5, maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Vui lòng quét mã <strong>VietQR</strong> bên dưới hoặc chuyển khoản đúng số tiền <strong style={{ color: '#dc2626' }}>{formatCurrency(createdOrder.totalAmount)}</strong>. Sau khi chuyển tiền thành công, hãy bấm xác nhận bên dưới để shop chuẩn bị cá giao đi nhé!
        </p>

        {/* Khối VietQR Chi Tiết */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 700, fontSize: '1rem' }}>
            <QrCode size={20} />
            <span>Quét mã VietQR để thanh toán nhanh</span>
          </div>

          {qrUrl ? (
            <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <img
                src={qrUrl}
                alt={`Mã VietQR ${paymentConfig?.bankName || ''}`}
                style={{ width: '260px', height: 'auto', display: 'block', margin: '0 auto' }}
              />
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {paymentConfigError || 'Đang tải thông tin mã VietQR…'}
            </p>
          )}

          {/* Bảng chi tiết chuyển khoản kèm nút sao chép */}
          {paymentConfig && (
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                textAlign: 'left',
                fontSize: '0.875rem',
              }}
            >
              {/* Ngân hàng */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                <strong style={{ color: '#0f172a' }}>{paymentConfig.bankName}</strong>
              </div>

              {/* Số tài khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: '#0284c7', fontSize: '0.9375rem', letterSpacing: '0.5px' }}>{paymentConfig.accountNumber}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentConfig.accountNumber, 'account')}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: copiedField === 'account' ? '#dcfce7' : '#f1f5f9',
                      color: copiedField === 'account' ? '#15803d' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {copiedField === 'account' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'account' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Chủ tài khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{paymentConfig.accountName}</strong>
              </div>

              {/* Số tiền */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Số tiền chuyển:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: '#dc2626', fontSize: '1rem' }}>{formatCurrency(createdOrder.totalAmount)}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(createdOrder.totalAmount), 'amount')}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: copiedField === 'amount' ? '#dcfce7' : '#f1f5f9',
                      color: copiedField === 'amount' ? '#15803d' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {copiedField === 'amount' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Nội dung chuyển khoản */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #fde68a' }}>
                    {transferContent}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'content')}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: copiedField === 'content' ? '#dcfce7' : '#f1f5f9',
                      color: copiedField === 'content' ? '#15803d' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    {copiedField === 'content' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'content' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #fef3c7', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
            💡 <strong>Lưu ý:</strong> Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống đối soát tự động nhanh nhất.
          </div>
        </div>

        {/* Nút Tôi đã chuyển khoản */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setTransferred(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              width: '100%',
              maxWidth: '360px',
              transition: 'background-color 0.2s',
            }}
          >
            <Check size={18} />
            <span>Tôi đã chuyển khoản xong</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
              <ShoppingBag size={15} /> Xem lịch sử đơn hàng
            </Link>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
              <ArrowLeft size={15} /> Tiếp tục mua sắm
            </Link>
          </div>
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
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag color="#0284c7" size={20} />
          <span>Giỏ hàng ({totalItems} món)</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626' }}>
                    {formatCurrency(item.price)}
                  </span>
                  {typeof item.stock === 'number' && (
                    <span style={{ fontSize: '0.75rem', color: item.stock <= 3 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                      (Kho: {item.stock})
                    </span>
                  )}
                </div>
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
                  onClick={() => {
                    if (item.quantity <= 1) return;
                    updateQuantity(item._id, item.quantity - 1);
                  }}
                  disabled={item.quantity <= 1}
                  title={item.quantity <= 1 ? 'Số lượng tối thiểu là 1' : 'Giảm số lượng'}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: item.quantity <= 1 ? '#f1f5f9' : '#f8fafc',
                    cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                    opacity: item.quantity <= 1 ? 0.4 : 1,
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
                  type="button"
                  onClick={() => {
                    const maxStock = typeof item.stock === 'number' ? item.stock : Infinity;
                    if (item.quantity >= maxStock) return;
                    updateQuantity(item._id, item.quantity + 1);
                  }}
                  disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                  title={typeof item.stock === 'number' && item.quantity >= item.stock ? `Đã đạt số lượng tối đa trong kho (${item.stock} con)` : 'Tăng số lượng'}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: typeof item.stock === 'number' && item.quantity >= item.stock ? '#f1f5f9' : '#f8fafc',
                    cursor: typeof item.stock === 'number' && item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                    opacity: typeof item.stock === 'number' && item.quantity >= item.stock ? 0.4 : 1,
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
                onClick={() => {
                  if (window.confirm(`Xóa "${item.name}" khỏi giỏ hàng?`)) {
                    removeFromCart(item._id);
                  }
                }}
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
            Tóm tắt đơn hàng
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
              <input maxLength={20} value={couponInput} onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setAppliedCoupon(null); setCouponMessage(''); }} placeholder="Nhập mã voucher" style={{ minWidth: 0, flex: 1, padding: '0.5rem 0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
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

          {!isAuthenticated && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                color: '#1e40af',
                lineHeight: 1.4,
              }}
            >
              💡 <strong>Lưu ý:</strong> Bạn đang thao tác với tư cách khách. Vui lòng{' '}
              <Link to="/login" style={{ fontWeight: 700, color: '#0284c7', textDecoration: 'underline' }}>
                Đăng nhập
              </Link>{' '}
              để tích điểm và lưu lịch sử đơn hàng của bạn.
            </div>
          )}

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Số điện thoại nhận hàng *
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="0901234567 (10 - 11 số)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                Địa chỉ giao hàng (Chọn theo danh mục hành chính) *
              </label>
              <AddressDropdownSelector
                value={shippingAddress}
                onChange={(addr, reg) => {
                  setShippingAddress(addr);
                  if (reg && reg !== shippingRegion) {
                    setShippingRegion(reg);
                  }
                }}
                onRegionChange={(reg) => {
                  if (reg && reg !== shippingRegion) {
                    setShippingRegion(reg);
                  }
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
                backgroundColor: submitting ? '#94a3b8' : '#0284c7',
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
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#0369a1';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = '#0284c7';
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
