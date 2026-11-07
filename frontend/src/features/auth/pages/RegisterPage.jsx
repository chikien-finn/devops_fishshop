import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký tài khoản không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            backgroundColor: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #bfdbfe',
          }}
        >
          <UserPlus color="#0284c7" size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Đăng ký tài khoản mới
          </h2>
        </div>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Tạo tài khoản AquaCraft để mua cá cảnh, thủy sinh và quản lý đơn hàng.
      </p>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.875rem',
            borderRadius: '4px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Họ và tên <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Nguyễn Văn A"
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Địa chỉ Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Ít nhất 6 ký tự"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Xác nhận mật khẩu <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="0901234567"
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Địa chỉ nhận hàng mặc định
          </label>
          <input
            type="text"
            name="address"
            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            value={formData.address}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '0.625rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <UserPlus size={16} />
          {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

