import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  User,
  ShoppingBag,
  Search,
  ChevronDown,
  Flame,
  ShieldCheck,
  LogOut,
  Fish,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';
import { useCart } from '../../features/cart/hooks/useCart.jsx';
import Logo from '../common/Logo.jsx';
import FloatingActions from '../common/FloatingActions.jsx';

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [infoModal, setInfoModal] = useState(null); // 'models' | 'knowledge' | 'about'
  const navigate = useNavigate();
  const location = useLocation();

  const productCategoriesMenu = [
    { name: 'Cá Neon', link: '/products?search=Neon' },
    { name: 'Cá Dĩa', link: '/products?search=Dĩa' },
    { name: 'Cá Thần Tiên', link: '/products?search=Thần Tiên' },
    { name: 'Cá Chuột', link: '/products?search=Chuột' },
    { name: 'Cá Phượng Hoàng', link: '/products?search=Phượng Hoàng' },
    { name: 'Cá Ali Thái', link: '/products?search=Ali' },
    { name: 'Cá Molly, Bình Tích', link: '/products?search=Molly, Bình Tích' },
    { name: 'Cá Betta', link: '/products?search=Betta' },
    { name: 'Cá Bảy Màu', link: '/products?search=Bảy Màu' },
    { name: 'Cá Cầu Vồng', link: '/products?search=Cầu Vồng' },
    { name: 'Tép Thủy Sinh', link: '/products?search=Tép' },
    { name: 'Lau Kiếng, Vệ Sinh Hồ', link: '/products?search=Lau Kiếng, Vệ Sinh Hồ' },
    { name: 'Thức Ăn Cá', link: '/products?category=food' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      {/* 1. TOP HEADER (LOGO, SEARCH, HOTLINE, ACCOUNT, CART) */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '0.75rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Logo - No red border, clean AquaCraft branding */}
          <div style={{ flexShrink: 0 }}>
            <Logo size={46} showText={true} textColor="#0284c7" />
          </div>

          {/* Search Bar - Rounded pill shape */}
          <form
            onSubmit={handleSearch}
            style={{
              flex: '1',
              maxWidth: '460px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm cá cảnh, phụ kiện, thức ăn..."
              style={{
                width: '100%',
                padding: '0.625rem 3rem 0.625rem 1.25rem',
                borderRadius: '9999px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0284c7';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.backgroundColor = '#f8fafc';
              }}
            />
            <button
              type="submit"
              title="Tìm kiếm"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.4rem 0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={18} />
            </button>
          </form>

          {/* Right Action Icons & Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
            {/* Hotline */}
            <a
              href="tel:0332127582"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Phone size={18} />
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Hỗ Trợ Khách Hàng</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>0332127582</span>
              </div>
            </a>

            {/* Account */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                }}
              >
                <User size={18} />
              </div>
              {isAuthenticated ? (
                <div style={{ lineHeight: 1.2 }}>
                  <Link
                    to="/profile"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    {user?.name || 'Tài khoản'}
                  </Link>
                  <button
                    onClick={logout}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <LogOut size={11} /> Đăng xuất
                  </button>
                </div>
              ) : (
                <div style={{ lineHeight: 1.25 }}>
                  <Link
                    to="/login"
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      textDecoration: 'none',
                      display: 'block',
                    }}
                  >
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>

            {/* Admin Badge if admin */}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'none',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.6rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                }}
              >
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            )}

            {/* Cart Button with badge count */}
            <Link
              to="/cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1.5px solid #0284c7',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: 700,
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <div
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={16} />
              </div>
              <span>Giỏ Hàng</span>
              <span
                style={{
                  backgroundColor: '#eab308',
                  color: '#713f12',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  borderRadius: '4px',
                  padding: '1px 6px',
                }}
              >
                {totalItems}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION BAR (MENU) */}
      <nav
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: isActive('/') ? '#0284c7' : '#1e293b',
              borderBottom: isActive('/') ? '2px solid #0284c7' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.15s',
            }}
          >
            TRANG CHỦ
          </Link>

          {/* Danh Sách Sản Phẩm with Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link
              to="/products"
              style={{
                textDecoration: 'none',
                color: isActive('/products') ? '#0284c7' : '#1e293b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>DANH SÁCH SẢN PHẨM</span>
              <ChevronDown size={15} />
            </Link>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06)',
                  minWidth: '220px',
                  zIndex: 50,
                  padding: '0.4rem 0',
                }}
              >
                {productCategoriesMenu.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '0.55rem 1.25rem',
                      textDecoration: 'none',
                      color: '#1e293b',
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      transition: 'background-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#1e293b';
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/products?sale=true"
            style={{
              textDecoration: 'none',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Flame size={16} color="#dc2626" />
            <span>CÁ GIẢM GIÁ</span>
          </Link>

          <button
            onClick={() => setInfoModal('models')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            MẪU HỒ CÁ
          </button>

          <button
            onClick={() => setInfoModal('knowledge')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            KIẾN THỨC NUÔI CÁ
          </button>

          <button
            onClick={() => setInfoModal('about')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1e293b',
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            GIỚI THIỆU
          </button>
        </div>
      </nav>

      {/* 3. MAIN CONTENT */}
      <main style={{ flex: 1, padding: '1.5rem 1rem' }}>
        <Outlet />
      </main>

      {/* 4. FOOTER */}
      <footer
        style={{
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          padding: '2.5rem 1.5rem 1.5rem',
          borderTop: '3px solid #0284c7',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="AquaCraft" style={{ height: '42px', width: 'auto' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                  AQUACRAFT
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Trang trại nuôi và cung cấp các dòng cá cảnh thuần chủng, cây thủy sinh và phụ kiện hồ cá cao cấp chuẩn quốc tế.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
              THÔNG TIN LIÊN HỆ
            </h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              📍 <strong>Địa chỉ:</strong> 57 Lê Thị Siêng, Ấp Tiền, Tân Thông Hội, Củ Chi, TP. Hồ Chí Minh
            </p>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>
              📞 <strong>Hotline:</strong> 0332127582 (Zalo 24/7)
            </p>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
              ✉️ <strong>Email:</strong> support@aquacraft.vn
            </p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>
              CHÍNH SÁCH BÁN HÀNG
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', lineHeight: 2, color: '#94a3b8' }}>
              <li>✓ Đóng bao oxy 48h giao tận nhà toàn quốc</li>
              <li>✓ Cam kết cá khỏe 100% khi nhận hàng</li>
              <li>✓ Bảo hành 1 đổi 1 nếu rủi ro vận chuyển</li>
              <li>✓ Hướng dẫn kỹ thuật dưỡng nước & thuần cá</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            borderTop: '1px solid #1e293b',
            paddingTop: '1rem',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#64748b',
          }}
        >
          &copy; {new Date().getFullYear()} AquaCraft. Tất cả quyền được bảo lưu.
        </div>
      </footer>

      {/* Floating Action Buttons (Cart, Hotline, Zalo, Messenger) */}
      <FloatingActions />

      {/* INFO MODALS */}
      {infoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setInfoModal(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              {infoModal === 'models' && '🌿 Bộ Sưu Tập Mẫu Hồ Cá Thủy Sinh'}
              {infoModal === 'knowledge' && '📖 Cẩm Nang & Kiến Thức Nuôi Cá Cảnh'}
              {infoModal === 'about' && '🏢 Giới Thiệu Về Hệ Thống AquaCraft'}
            </h2>
            <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {infoModal === 'models' && (
                <div>
                  <p>AquaCraft thiết kế và thi công trọn gói các hệ thống hồ cá:</p>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                    <li>Hồ Thủy Sinh phong cách Iwagumi, phong cách Nature Nhật Bản.</li>
                    <li>Hồ Cá Biển san hô công nghệ lọc vi sinh hiện đại.</li>
                    <li>Hồ Biotop mô phỏng dòng sông Amazon hoang dã.</li>
                  </ul>
                </div>
              )}
              {infoModal === 'knowledge' && (
                <div>
                  <p>Các nguyên tắc vàng giúp cá khỏe mạnh, lên màu rực rỡ:</p>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                    <li><strong>Chu trình vi sinh (Cycle hồ):</strong> Chạy lọc vi sinh tối thiểu 7-14 ngày trước khi thả cá.</li>
                    <li><strong>Nhiệt độ nước:</strong> Ổn định ở mức 26-28°C cho các dòng cá nhiệt đới.</li>
                    <li><strong>Cho ăn điều độ:</strong> Cho lượng thức ăn cá có thể ăn hết trong 2-3 phút, tránh dư thừa gây đục nước.</li>
                  </ul>
                </div>
              )}
              {infoModal === 'about' && (
                <div>
                  <p>
                    AquaCraft tự hào là trang trại chuyên nhân giống, thuần dưỡng và phân phối sỉ lẻ các dòng cá cảnh chất lượng cao:
                  </p>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                    <li>Hơn 50 giống cá cảnh thuần chủng (Cá Dĩa, Cá Neon, Cá Thần Tiên, Cá Betta...).</li>
                    <li>Quy trình tuyển chọn nghiêm ngặt, xét nghiệm mầm bệnh trước khi xuất trại.</li>
                    <li>Đội ngũ chuyên gia thủy sinh đồng hành hỗ trợ trọn đời.</li>
                  </ul>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setInfoModal(null)}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
