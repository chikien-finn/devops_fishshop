import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const cleanInput = email.trim();
    if (!cleanInput) {
      setError('Vui lòng nhập tài khoản hoặc email.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    // Tự động nhận diện:
    // admin -> admin@aquacraft.com
    // kien hoặc tên bất kỳ không có @ -> kien@gmail.com
    let submitIdentifier = cleanInput;
    if (cleanInput.toLowerCase() === 'admin') {
      submitIdentifier = 'admin@aquacraft.com';
    } else if (!cleanInput.includes('@')) {
      submitIdentifier = `${cleanInput}@gmail.com`;
    }

    setLoading(true);
    try {
      const data = await login(submitIdentifier, password);
      if (data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '3rem auto',
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
          Đăng nhập
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

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Tài khoản hoặc Email
          </label>
          <input
            type="text"
            maxLength={100}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập tài khoản hoặc email..."
            required
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
              Mật khẩu
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
              Quên mật khẩu?
            </Link>
          </div>
          <input
            type="password"
            maxLength={64}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
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
          <LogIn size={16} />
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
