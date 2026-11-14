import { Outlet, NavLink, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  Fish,
  LogOut,
  Layers,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Bảng điều khiển tổng quan (Dashboard)';
    if (location.pathname.startsWith('/admin/products')) return 'Quản lý cá cảnh & thủy sinh';
    if (location.pathname.startsWith('/admin/orders')) return 'Quản lý đơn đặt hàng';
    if (location.pathname.startsWith('/admin/users')) return 'Quản lý khách hàng & người dùng';
    if (location.pathname.startsWith('/admin/reviews')) return 'Quản lý đánh giá & bình luận';
    return 'Quản trị hệ thống';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#0284c7' : '#475569',
    backgroundColor: isActive ? '#f0f9ff' : 'transparent',
    borderLeft: isActive ? '3px solid #0284c7' : '3px solid transparent',
    borderRadius: '4px',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Sidebar - Tông màu trắng thanh lịch */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 20,
        }}
      >
        {/* Brand */}
        <Link
          to="/admin"
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
          }}
        >
          <img
            src="/logo.png"
            alt="AquaCraft Logo"
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1 }}>
              AquaCraft
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
              Hệ thống Quản Trị
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quản trị cửa hàng
          </div>

          <NavLink to="/admin" end style={navItemStyle}>
            <LayoutDashboard size={18} />
            <span>Tổng quan (Dashboard)</span>
          </NavLink>

          <NavLink to="/admin/products" style={navItemStyle}>
            <Fish size={18} />
            <span>Quản lý Cá cảnh</span>
          </NavLink>

          <NavLink to="/admin/orders" style={navItemStyle}>
            <ShoppingCart size={18} />
            <span>Đơn đặt hàng</span>
          </NavLink>

          <NavLink to="/admin/users" style={navItemStyle}>
            <Users size={18} />
            <span>Khách hàng & User</span>
          </NavLink>

          <NavLink to="/admin/reviews" style={navItemStyle}>
            <MessageSquare size={18} />
            <span>Đánh giá &amp; Bình luận</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              color: '#475569',
              fontSize: '0.8125rem',
              textDecoration: 'none',
              borderRadius: '4px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <ArrowLeft size={15} />
            <span>Xem giao diện bán hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar - Tông màu trắng */}
        <header
          style={{
            height: '60px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            <span>Admin</span>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{getPageTitle()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.625rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
