import { Outlet, Link } from 'react-router-dom';
import { Fish, ShoppingBag, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#0284c7',
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          <Fish size={28} />
          <span>AquaCraft</span>
        </Link>

        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/products" style={{ textDecoration: 'none', color: '#475569', fontSize: '0.875rem', fontWeight: 500 }}>
            Sản phẩm
          </Link>

          <Link
            to="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <ShoppingBag size={18} />
            <span>Giỏ hàng</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                color: '#0284c7',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0.35rem 0.625rem',
                backgroundColor: '#eff6ff',
                borderRadius: '4px',
                border: '1px solid #bfdbfe',
              }}
            >
              <ShieldCheck size={15} />
              <span>Quản trị Admin</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.625rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                <User size={16} color="#0284c7" />
                <span>{user?.name || 'Tài khoản'}</span>
              </Link>

              <button
                onClick={logout}
                title="Đăng xuất"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={14} />
                <span>Thoát</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.375rem 0.75rem',
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                style={{
                  textDecoration: 'none',
                  color: '#ffffff',
                  backgroundColor: '#0284c7',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  padding: '0.375rem 0.875rem',
                  borderRadius: '4px',
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>

      <footer
        style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          backgroundColor: '#ffffff',
        }}
      >
        &copy; {new Date().getFullYear()} AquaCraft - Hệ thống thủy sinh & cá cảnh cao cấp.
      </footer>
    </div>
  );
}
