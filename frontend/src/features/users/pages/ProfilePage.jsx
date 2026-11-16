import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Lock,
  Package,
  ShoppingBag,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import { useCart } from '../../cart/hooks/useCart.jsx';
import authService from '../../auth/services/authService.js';
import { orderService } from '../../orders/services/orderService.js';
import { formatDate, formatCurrency } from '../../../utils/formatters.js';

const ORDER_STATUS_MAP = {
  pending: { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#92400e' },
  confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', color: '#1e40af' },
  shipping: { label: 'Đang giao hàng', bg: '#e0e7ff', color: '#3730a3' },
  delivered: { label: 'Đã giao thành công', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'Đã hủy', bg: '#fee2e2', color: '#991b1b' },
};

export default function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Tab & Order history state
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [reorderMsg, setReorderMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const handleReorder = (ord) => {
    if (!ord.items || ord.items.length === 0) return;
    ord.items.forEach((item) => {
      addToCart(
        {
          _id: item.product || item._id,
          id: item.product || item._id,
          name: item.name,
          price: item.price || 0,
          slug: item.slug,
          image: item.image,
        },
        item.quantity || 1
      );
    });
    setReorderMsg(`Đã thêm ${ord.items.length} món từ đơn #${ord._id.slice(-6).toUpperCase()} vào giỏ hàng!`);
    setTimeout(() => {
      navigate('/cart');
    }, 700);
  };

  const fetchMyOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const data = await orderService.getMyOrders();
      setMyOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ và tên');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (passwordForm.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
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
      setFeedback({ type: 'success', message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Không thể đổi mật khẩu.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', backgroundColor: '#ffffff', padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
        <ShieldAlert size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Bạn chưa đăng nhập
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Vui lòng đăng nhập để xem và chỉnh sửa thông tin hồ sơ cá nhân.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fecaca'}`,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            borderRadius: '4px',
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

      {/* Profile Overview Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '4px',
              backgroundColor: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              border: '1px solid #bfdbfe',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {user?.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user?.email}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: user?.role === 'admin' ? '#ecfdf5' : '#f1f5f9',
                  color: user?.role === 'admin' ? '#059669' : '#475569',
                  border: `1px solid ${user?.role === 'admin' ? '#a7f3d0' : '#e2e8f0'}`,
                }}
              >
                <Shield size={12} />
                {user?.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng'}
              </span>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: '#0284c7',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <span>Vào Bảng Quản Trị Admin</span>
            <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {/* Profile Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'profile' ? '#0284c7' : '#64748b',
            fontSize: '0.925rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <User size={16} />
          <span>Thông Tin Cá Nhân & Bảo Mật</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'orders' ? '#0284c7' : '#64748b',
            fontSize: '0.925rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '-2px',
          }}
        >
          <Package size={16} />
          <span>Lịch Sử Đơn Hàng ({myOrders.length})</span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          {/* Profile Form Details */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
          Thông Tin Cá Nhân & Giao Hàng
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Cập nhật thông tin giao nhận để đơn hàng cá cảnh và thủy sinh được chuyển đến đúng địa chỉ.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Họ và tên <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Địa chỉ Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
              Email tài khoản không thể chỉnh sửa.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Số điện thoại nhận hàng
            </label>
            <input
              type="tel"
              placeholder="0901234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Địa chỉ nhận hàng mặc định
            </label>
            <textarea
              rows={3}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: '#ffffff',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <Clock size={14} />
            <span>Ngày đăng ký tài khoản: {user?.createdAt ? formatDate(user.createdAt) : 'Mới tham gia'}</span>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Lock size={18} color="#0284c7" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Đổi Mật Khẩu
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Cập nhật mật khẩu mới cho tài khoản AquaCraft của bạn.
        </p>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu đang dùng"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                placeholder="Ít nhất 6 ký tự"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={changingPassword}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: changingPassword ? 'not-allowed' : 'pointer',
              }}
            >
              <Lock size={15} />
              {changingPassword ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
            </button>
          </div>
        </form>
      </div>
      </>
    ) : (
      /* Order History Tab View */
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Danh Sách Đơn Hàng Của Tôi ({myOrders.length})
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              Theo dõi tình trạng đơn đặt hàng cá cảnh và lịch sử giao nhận
            </p>
          </div>
          <button
            onClick={fetchMyOrders}
            disabled={ordersLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.8rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              color: '#334155',
              cursor: ordersLoading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={ordersLoading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>

        {ordersError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {ordersError}
          </div>
        )}

        {reorderMsg && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.65rem 1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '6px',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            {reorderMsg}
          </div>
        )}

        {ordersLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            Đang tải lịch sử đơn hàng...
          </div>
        ) : myOrders.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Bạn chưa có đơn hàng nào
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Hãy dạo qua cửa hàng và chọn những mẫu cá cảnh, thủy sinh yêu thích!
            </p>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <span>Xem danh sách sản phẩm</span>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Mã Đơn</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Thời Gian</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Sản Phẩm</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Tổng Tiền</th>
                  <th style={{ padding: '0.75rem 0.85rem' }}>Trạng Thái</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((ord) => {
                  const st = ORDER_STATUS_MAP[ord.status] || ORDER_STATUS_MAP.pending;
                  return (
                    <tr key={ord._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        #{ord._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {ord.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', color: '#334155' }}>
                            • {item.name} <strong>x{item.quantity}</strong>
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0284c7' }}>
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            backgroundColor: st.bg,
                            color: st.color,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleReorder(ord)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.35rem 0.65rem',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            color: '#0284c7',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0284c7';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                            e.currentTarget.style.color = '#0284c7';
                          }}
                          title="Thêm lại tất cả sản phẩm của đơn này vào giỏ hàng"
                        >
                          <RotateCcw size={12} />
                          Mua lại
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
    </div>
  );
}

