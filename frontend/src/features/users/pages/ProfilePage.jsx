import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Clock3,
  ArrowRight,
  ShieldAlert,
  Lock,
  Package,
  PackageCheck,
  Truck,
  XCircle,
  ShoppingBag,
  LogOut,
  Trash2,
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import authService from '../../auth/services/authService.js';
import { useCart } from '../../cart/hooks/useCart.jsx';
import orderService from '../../orders/services/orderService.js';
import { formatCurrency, formatDate } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';
import AddressDropdownSelector from '../../../components/common/AddressDropdownSelector.jsx';

const ORDER_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const ORDER_STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', icon: Clock3, color: '#a16207', background: '#fef9c3', border: '#fef08a' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle2, color: '#1d4ed8', background: '#dbeafe', border: '#bfdbfe' },
  shipping: { label: 'Đang giao', icon: Truck, color: '#6d28d9', background: '#ede9fe', border: '#ddd6fe' },
  delivered: { label: 'Đã giao', icon: PackageCheck, color: '#047857', background: '#d1fae5', border: '#a7f3d0' },
  cancelled: { label: 'Đã hủy', icon: XCircle, color: '#b91c1c', background: '#fee2e2', border: '#fecaca' },
};

const PAYMENT_STATUS_MAP = {
  pending: 'Chờ bạn thanh toán',
  paid: 'Đã thanh toán thành công',
  failed: 'Thanh toán chưa thành công',
  refunded: 'Đã hoàn tiền',
  unpaid: 'Chưa thanh toán',
  expired: 'Đã hết hạn thanh toán',
};

const formatOrderDate = (date) =>
  date
    ? new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export default function ProfilePage({ defaultTab }) {
  const { user, updateProfile, isAuthenticated, logout } = useAuth();
  const {
    cart: cartItems = [],
    totalItems: cartCount = 0,
    totalAmount: cartTotal = 0,
    removeFromCart,
    updateQuantity,
  } = useCart() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab: 'info' | 'orders' | 'cart' | 'password'
  const activeTab = searchParams.get('tab') || defaultTab || 'info';

  const setTab = (newTab) => {
    setFeedback(null);
    setSearchParams(newTab === 'info' ? {} : { tab: newTab });
  };

  // Profile Edit State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);
  const [orderTotalItems, setOrderTotalItems] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [cancelErrors, setCancelErrors] = useState({});
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentConfigRequested, setPaymentConfigRequested] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // Load orders when activeTab === 'orders'
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || activeTab !== 'orders') return;
    setOrdersLoading(true);
    setOrderError('');
    try {
      const result = await orderService.getMyOrders({
        page: orderPage,
        limit: orderPageSize,
        status: orderFilter,
      });
      setOrders(result.items || []);
      setOrderTotalItems(result.pagination?.totalItems || 0);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setOrdersLoading(false);
    }
  }, [activeTab, isAuthenticated, orderFilter, orderPage, orderPageSize]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const needsBankTransfer = orders.some(
    (order) => order.paymentMethod === 'banking' && ['pending', 'failed'].includes(order.paymentStatus || 'pending')
  );

  useEffect(() => {
    if (!needsBankTransfer || paymentConfigRequested) return;
    setPaymentConfigRequested(true);
    orderService
      .getPaymentConfig()
      .then((cfg) => setPaymentConfig(cfg))
      .catch(() => {});
  }, [needsBankTransfer, paymentConfigRequested]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      setFeedback({ type: 'error', message: 'Họ và tên phải từ 2 đến 50 ký tự.' });
      return;
    }
    const cleanPhone = formData.phone ? formData.phone.replace(/\D/g, '').trim() : '';
    if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
      setFeedback({ type: 'error', message: 'Số điện thoại phải từ 10 đến 11 chữ số.' });
      return;
    }
    const cleanAddress = formData.address.trim();
    if (cleanAddress.length > 200) {
      setFeedback({ type: 'error', message: 'Địa chỉ nhận hàng tối đa 200 ký tự.' });
      return;
    }
    try {
      setSaving(true);
      await updateProfile({
        name: cleanName,
        phone: cleanPhone,
        address: cleanAddress,
      });
      setFeedback({ type: 'success', message: 'Cập nhật thông tin tài khoản thành công!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!passwordForm.currentPassword) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (passwordForm.newPassword.length < 6 || passwordForm.newPassword.length > 64) {
      setFeedback({ type: 'error', message: 'Mật khẩu mới phải từ 6 đến 64 ký tự.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    try {
      setChangingPassword(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'Đổi mật khẩu bảo mật thành công!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Mật khẩu hiện tại không chính xác.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async (order) => {
    const orderCode = order._id?.slice(-8).toUpperCase();
    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${orderCode}?`)) return;
    setCancellingOrderId(order._id);
    setCancelErrors((prev) => ({ ...prev, [order._id]: '' }));
    try {
      const updatedOrder = await orderService.cancelMyOrder(order._id);
      setOrders((prev) =>
        prev.map((item) => (item._id === order._id ? { ...item, status: updatedOrder.status } : item))
      );
      if (orderFilter === 'pending') await loadOrders();
    } catch (err) {
      setCancelErrors((prev) => ({
        ...prev,
        [order._id]: err.response?.data?.message || 'Không thể hủy đơn hàng.',
      }));
    } finally {
      setCancellingOrderId('');
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '4rem auto',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          padding: '2.5rem 2rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <ShieldAlert size={52} color="#f59e0b" style={{ margin: '0 auto 1.25rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Bạn chưa đăng nhập
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Vui lòng đăng nhập tài khoản AquaCraft để quản lý hồ sơ, theo dõi đơn hàng và giỏ hàng của bạn.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const navMenuItems = [
    { id: 'info', label: 'Hồ Sơ Của Tôi', icon: User, badge: null },
    { id: 'orders', label: 'Đơn Mua / Lịch Sử', icon: Package, badge: orderTotalItems > 0 ? orderTotalItems : null },
    { id: 'cart', label: 'Giỏ Hàng Của Tôi', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : null },
    { id: 'password', label: 'Đổi Mật Khẩu', icon: Lock, badge: null },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '1.5rem auto 3rem', padding: '0 1rem' }}>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Trang chủ</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 700 }}>Tài khoản của tôi</span>
      </div>

      {/* Main 2-Column Shopee Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Sidebar: User profile badge & Navigation */}
        <aside
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* User mini profile header */}
          <div
            style={{
              padding: '1.5rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Khách hàng'}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                }}
              >
                {user?.email}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '6px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: user?.role === 'admin' ? '#ecfdf5' : '#e0f2fe',
                  color: user?.role === 'admin' ? '#059669' : '#0369a1',
                }}
              >
                <Shield size={11} />
                {user?.role === 'admin' ? 'Quản trị viên' : 'Khách thân thiết'}
              </div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <div style={{ padding: '0.75rem 0' }}>
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1.25rem',
                    background: isActive ? '#f0f9ff' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '4px solid #0284c7' : '4px solid transparent',
                    color: isActive ? '#0284c7' : '#334155',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        backgroundColor: isActive ? '#0284c7' : '#e2e8f0',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  color: '#059669',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderLeft: '4px solid transparent',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Shield size={18} color="#059669" />
                <span>Trang Quản Trị Admin</span>
              </Link>
            )}

            <div style={{ margin: '0.5rem 0', borderTop: '1px solid #f1f5f9' }} />

            <button
              type="button"
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                border: 'none',
                borderLeft: '4px solid transparent',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <LogOut size={18} color="#dc2626" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            minHeight: '520px',
          }}
        >
          {/* Feedback banner */}
          {feedback && (
            <div
              style={{
                padding: '0.875rem 1rem',
                marginBottom: '1.5rem',
                backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fecaca'}`,
                color: feedback.type === 'success' ? '#166534' : '#991b1b',
                borderRadius: '6px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: Profile Information */}
          {activeTab === 'info' && (
            <div>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Hồ Sơ Của Tôi
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Quản lý thông tin hồ sơ để bảo vệ tài khoản và nhận hàng chính xác.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Email đăng ký (Tên đăng nhập)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    Email là mã định danh tài khoản cố định và không thể thay đổi.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Họ và tên <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập họ và tên của bạn... (tối đa 50 ký tự)"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Số điện thoại nhận hàng
                  </label>
                  <input
                    type="tel"
                    maxLength={11}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, '').slice(0, 11),
                      })
                    }
                    placeholder="Ví dụ: 0905123456 (10 - 11 số)"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Địa chỉ giao hàng mặc định (Chọn qua danh mục)
                  </label>
                  <AddressDropdownSelector
                    value={formData.address}
                    onChange={(addr) => setFormData((prev) => ({ ...prev, address: addr }))}
                  />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.5rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Save size={16} />
                    <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Orders Management (Shopee style) */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Đơn Mua Của Tôi
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Theo dõi trạng thái và lịch sử tất cả các đơn hàng cá cảnh &amp; phụ kiện của bạn.
                </p>
              </div>

              {/* Status Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem',
                  overflowX: 'auto',
                }}
              >
                {ORDER_FILTERS.map((f) => {
                  const isActive = orderFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => {
                        setOrderFilter(f.value);
                        setOrderPage(1);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#0284c7' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569',
                        border: '1px solid',
                        borderColor: isActive ? '#0284c7' : '#cbd5e1',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <Clock size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#0284c7' }} />
                  <p style={{ margin: 0 }}>Đang tải danh sách đơn hàng...</p>
                </div>
              ) : orderError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0 }}>{orderError}</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <Package size={52} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Chưa có đơn hàng nào
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Khám phá ngay bộ sưu tập cá cảnh và cây thủy sinh phong phú của AquaCraft.
                  </p>
                  <Link
                    to="/products"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    Mua sắm ngay
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {orders.map((order) => {
                    const st = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                    const StatusIcon = st.icon;
                    const orderCode = order._id?.slice(-8).toUpperCase();
                    const isPending = order.status === 'pending';

                    return (
                      <div
                        key={order._id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        {/* Order Header */}
                        <div
                          style={{
                            padding: '0.875rem 1.25rem',
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                              #{orderCode}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {formatOrderDate(order.createdAt)}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: st.background,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                            }}
                          >
                            <StatusIcon size={14} />
                            <span>{st.label}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ padding: '1rem 1.25rem' }}>
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                padding: '0.625rem 0',
                                borderBottom: idx < order.items.length - 1 ? '1px dashed #f1f5f9' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.name}
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                ) : (
                                  <div style={{ width: '48px', height: '48px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                                )}
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.name}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Số lượng: x{item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', color: '#0284c7' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div
                          style={{
                            padding: '0.875rem 1.25rem',
                            backgroundColor: '#fafafa',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '6px' }}>Thành tiền:</span>
                            <strong style={{ fontSize: '1.05rem', color: '#dc2626', fontWeight: 800 }}>
                              {formatCurrency(order.totalAmount)}
                            </strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                              ({order.paymentMethod === 'banking' ? 'Chuyển khoản VietQR' : 'Thanh toán COD'})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            {isPending && (
                              <button
                                type="button"
                                disabled={cancellingOrderId === order._id}
                                onClick={() => handleCancelOrder(order)}
                                style={{
                                  padding: '0.45rem 0.85rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#dc2626',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '4px',
                                  cursor: cancellingOrderId === order._id ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {cancellingOrderId === order._id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                              </button>
                            )}

                            <Link
                              to="/products"
                              style={{
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#0284c7',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '4px',
                                textDecoration: 'none',
                              }}
                            >
                              Mua thêm
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination for orders */}
                  {orderTotalItems > orderPageSize && (
                    <div style={{ marginTop: '1rem' }}>
                      <Pagination
                        currentPage={orderPage}
                        totalPages={Math.ceil(orderTotalItems / orderPageSize)}
                        onPageChange={setOrderPage}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: My Cart Overview */}
          {activeTab === 'cart' && (
            <div>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Giỏ Hàng Của Tôi ({cartCount} sản phẩm)
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Xem lại và quản lý các sản phẩm cá cảnh &amp; phụ kiện bạn đã chọn mua.
                </p>
              </div>

              {(!cartItems || cartItems.length === 0) ? (
                <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                  <ShoppingBag size={52} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Giỏ hàng của bạn đang trống
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Hãy dạo quanh cửa hàng để tìm những chú cá cảnh xinh xắn và cây thủy sinh tươi tốt!
                  </p>
                  <Link
                    to="/products"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.5rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    Khám phá sản phẩm
                  </Link>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {(cartItems || []).map((item) => (
                      <div
                        key={item._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          padding: '1rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/products/${item.slug || item._id}`}
                              style={{
                                fontSize: '0.925rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                textDecoration: 'none',
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name}
                            </Link>
                            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                              Đơn giá: {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: item.quantity <= 1 ? '#f1f5f9' : '#f8fafc',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              opacity: item.quantity <= 1 ? 0.4 : 1,
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '24px', textAlign: 'center' }}>
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
                            title={typeof item.stock === 'number' && item.quantity >= item.stock ? `Đã đạt giới hạn tồn kho (${item.stock} con)` : 'Tăng số lượng'}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: typeof item.stock === 'number' && item.quantity >= item.stock ? '#f1f5f9' : '#f8fafc',
                              cursor: typeof item.stock === 'number' && item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                              fontWeight: 700,
                              opacity: typeof item.stock === 'number' && item.quantity >= item.stock ? 0.4 : 1,
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div style={{ minWidth: '100px', textAlign: 'right' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#dc2626' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </strong>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total & Checkout Bar */}
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Tổng thanh toán ({cartCount} sản phẩm):</span>
                      <strong style={{ fontSize: '1.25rem', color: '#dc2626', fontWeight: 800, marginLeft: '8px' }}>
                        {formatCurrency(cartTotal)}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link
                        to="/products"
                        style={{
                          padding: '0.625rem 1.25rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#475569',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          textDecoration: 'none',
                        }}
                      >
                        Tiếp tục mua hàng
                      </Link>

                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          backgroundColor: '#0284c7',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <ShoppingBag size={16} />
                        <span>Vào Giỏ Hàng &amp; Thanh Toán</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Change Password */}
          {activeTab === 'password' && (
            <div>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                  Đổi Mật Khẩu
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '500px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Mật khẩu hiện tại <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={64}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại..."
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Mật khẩu mới <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    maxLength={64}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự..."
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Xác nhận mật khẩu mới <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    maxLength={64}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới..."
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.85rem',
                      fontSize: '0.875rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.5rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: changingPassword ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Lock size={16} />
                    <span>{changingPassword ? 'Đang cập nhật...' : 'Xác Nhận Đổi Mật Khẩu'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
