import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
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
    const { name, value } = e.target;
    if (name === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: numeric }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = formData.name.trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      setError('Họ và tên phải từ 2 đến 50 ký tự.');
      return;
    }

    const cleanEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
      setError('Địa chỉ email không đúng định dạng hoặc vượt quá 100 ký tự.');
      return;
    }

    if (formData.password.length < 6 || formData.password.length > 64) {
      setError('Mật khẩu phải từ 6 đến 64 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 11)) {
      setError('Số điện thoại phải từ 10 đến 11 chữ số.');
      return;
    }

    if (formData.address.trim().length > 200) {
      setError('Địa chỉ nhận hàng tối đa 200 ký tự.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: cleanName,
        email: cleanEmail,
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
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
        <img
          src="/logo.png"
          alt="AquaCraft"
          style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
        />
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0284c7', margin: 0, letterSpacing: '-0.01em' }}>
          Đăng ký
        </h2>
      </div>

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
            maxLength={50}
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
            maxLength={100}
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
              minLength={6}
              maxLength={64}
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
              minLength={6}
              maxLength={64}
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
            maxLength={11}
            placeholder="0901234567 (10 - 11 số)"
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
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

