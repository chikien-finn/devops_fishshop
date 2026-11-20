import { useState, useRef, useEffect } from 'react';
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
  MapPin,
  Mail,
  Check,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth.jsx';
import { useCart } from '../../features/cart/hooks/useCart.jsx';
import { FISH_SUBCATEGORIES } from '../../features/products/utils/productMapper.js';
import productService, { isRequestCanceled } from '../../features/products/services/productService.js';
import { formatCurrency } from '../../utils/formatters.js';
import Logo from '../common/Logo.jsx';
import FloatingActions from '../common/FloatingActions.jsx';

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeDropdownTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearchLoading(true);
      productService
        .getProducts({ search: searchTerm.trim(), limit: 5 }, { signal: controller.signal })
        .then((res) => {
          setSuggestions(res.items || []);
          setShowSuggestions(true);
        })
        .catch((err) => {
          if (!isRequestCanceled(err)) {
            setSuggestions([]);
          }
        })
        .finally(() => setSearchLoading(false));
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    setShowSuggestions(false);
    setSearchTerm('');
    navigate(`/products/${item.slug || item._id}`);
  };

  useEffect(() => {
    return () => {
      if (closeDropdownTimer.current) {
        clearTimeout(closeDropdownTimer.current);
      }
    };
  }, []);

  const openDropdown = () => {
    if (closeDropdownTimer.current) {
      clearTimeout(closeDropdownTimer.current);
      closeDropdownTimer.current = null;
    }
    setDropdownOpen(true);
  };

  const closeDropdownDelayed = () => {
    if (closeDropdownTimer.current) {
      clearTimeout(closeDropdownTimer.current);
    }
    closeDropdownTimer.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  const closeDropdownNow = () => {
    if (closeDropdownTimer.current) {
      clearTimeout(closeDropdownTimer.current);
      closeDropdownTimer.current = null;
    }
    setDropdownOpen(false);
  };

  const productCategoriesMenu = [
    ...FISH_SUBCATEGORIES.filter((c) => c.value !== 'ca-canh').map((c) => ({
      name: c.menuLabel,
      link: c.route || `/products?subCategory=${c.value}`,
    })),
    { name: 'Thức Ăn Cá', link: '/products?category=food' },
  ];

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* 1. TOP HEADER */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <div style={{ flexShrink: 0 }}>
            <Logo size={42} showText={true} textColor="#0284c7" />
          </div>

          {/* Search Bar */}
          <div
            ref={searchContainerRef}
            style={{
              flex: '1 1 280px',
              maxWidth: '440px',
              minWidth: '200px',
              position: 'relative',
            }}
          >
            <form
              onSubmit={handleSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                width: '100%',
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Tìm cá cảnh, phụ kiện, thức ăn..."
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 40px 0 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
                onFocusCapture={(e) => {
                  e.target.style.borderColor = '#0284c7';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlurCapture={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
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
                  padding: '6px 10px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search size={16} />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  border: '1px solid #e2e8f0',
                  zIndex: 100,
                  overflow: 'hidden',
                  padding: '4px 0',
                }}
              >
                {searchLoading && suggestions.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#64748b' }}>
                    Đang tìm kiếm...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '0.8125rem', color: '#64748b' }}>
                    Không tìm thấy sản phẩm nào khớp với &quot;{searchTerm}&quot;
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#64748b',
                      }}
                    >
                      Gợi ý ({suggestions.length})
                    </div>
                    {suggestions.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <img
                          src={item.image || 'https://placehold.co/40x40?text=Fish'}
                          alt={item.name}
                          style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/40x40?text=Fish';
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </p>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={handleSearch}
                      style={{
                        padding: '8px 14px',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#0284c7',
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    >
                      Xem tất cả kết quả cho &quot;{searchTerm}&quot; →
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            {/* Hotline */}
            <a
              href="tel:0332127582"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: '#334155',
                fontSize: '0.8125rem',
              }}
            >
              <Phone size={15} color="#0284c7" />
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748b', display: 'block', lineHeight: 1.2 }}>Tư vấn 24/7</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>0332 127 582</span>
              </div>
            </a>

            {/* Cart Button with quiet badge */}
            <Link
              to="/cart"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                height: '36px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontWeight: 500,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <ShoppingBag size={16} color="#0284c7" />
              <span>Giỏ hàng</span>
              <span
                style={{
                  backgroundColor: totalItems > 0 ? '#0284c7' : '#f1f5f9',
                  color: totalItems > 0 ? '#ffffff' : '#64748b',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  borderRadius: '9999px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {totalItems}
              </span>
            </Link>

            {/* Admin Badge */}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  color: '#0284c7',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  height: '32px',
                  padding: '0 10px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                  whiteSpace: 'nowrap',
                }}
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* Account */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to={user?._id ? `/profile/${user._id}` : '/profile'}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                  }}
                  title="Hồ sơ tài khoản"
                >
                  <User size={16} />
                </Link>
                <div style={{ lineHeight: 1.3 }}>
                  <Link
                    to={user?._id ? `/profile/${user._id}` : '/profile'}
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      textDecoration: 'none',
                      display: 'block',
                      whiteSpace: 'nowrap',
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
                      fontSize: '0.6875rem',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    <LogOut size={10} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.color = '#0284c7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '34px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION BAR */}
      <nav
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            rowGap: '8px',
            flexWrap: 'wrap',
            padding: '10px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: isActive('/') ? '#0284c7' : '#334155',
              borderBottom: isActive('/') ? '2px solid #0284c7' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.15s',
            }}
          >
            Trang chủ
          </Link>

          {/* Danh Sách Sản Phẩm with Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdownDelayed}
          >
            <Link
              to="/products"
              style={{
                textDecoration: 'none',
                color: isActive('/products') ? '#0284c7' : '#334155',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                paddingBottom: '4px',
                borderBottom: isActive('/products') ? '2px solid #0284c7' : '2px solid transparent',
                transition: 'color 0.15s',
              }}
            >
              <span>Danh mục sản phẩm</span>
              <ChevronDown size={14} />
            </Link>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  paddingTop: '6px',
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                    minWidth: '220px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    padding: '6px 0',
                  }}
                >
                  {productCategoriesMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.link}
                      onClick={closeDropdownNow}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        textDecoration: 'none',
                        color: '#334155',
                        fontSize: '0.8125rem',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        transition: 'background-color 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.color = '#0284c7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#334155';
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/promotions"
            style={{
              textDecoration: 'none',
              color: isActive('/promotions') ? '#0284c7' : '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              paddingBottom: '4px',
              borderBottom: isActive('/promotions') ? '2px solid #0284c7' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            <Flame size={14} color="#0284c7" />
            <span>Ưu đãi & Khuyến mãi</span>
          </Link>

          <Link
            to="/tank-models"
            style={{
              textDecoration: 'none',
              color: isActive('/tank-models') ? '#0284c7' : '#334155',
              borderBottom: isActive('/tank-models') ? '2px solid #0284c7' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.15s',
            }}
          >
            Mẫu hồ cá
          </Link>

          <Link
            to="/knowledge"
            style={{
              textDecoration: 'none',
              color: isActive('/knowledge') ? '#0284c7' : '#334155',
              borderBottom: isActive('/knowledge') ? '2px solid #0284c7' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.15s',
            }}
          >
            Kinh nghiệm nuôi
          </Link>

          <Link
            to="/about"
            style={{
              textDecoration: 'none',
              color: isActive('/about') ? '#0284c7' : '#334155',
              borderBottom: isActive('/about') ? '2px solid #0284c7' : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.15s',
            }}
          >
            Giới thiệu
          </Link>
        </div>
      </nav>

      {/* 3. MAIN CONTENT */}
      <main style={{ flex: 1, padding: '24px 16px' }}>
        <Outlet />
      </main>

      {/* 4. FOOTER */}
      <footer
        style={{
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          padding: '40px 24px 24px',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <img src="/logo.png" alt="AquaCraft" style={{ height: '36px', width: 'auto' }} />
              <div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  AquaCraft
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '34ch' }}>
              Trang trại sinh vật cảnh và cung cấp các dòng cá thủy sinh thuần chủng, phụ kiện hồ cá đạt tiêu chuẩn tuyển chọn.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>
              Thông tin liên hệ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color="#38bdf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>TP. Đà Nẵng (Giao hỏa tốc nội thành & 48h toàn quốc)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Hotline: 0332 127 582 (Zalo 24/7)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Email: support@aquacraft.vn</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '12px', fontSize: '0.875rem' }}>
              Chính sách bán hàng
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Đóng bao oxy 48h giao tận nhà toàn quốc</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Cam kết cá khỏe mạnh 100% khi nhận hàng</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Bảo hành 1 đổi 1 nếu có rủi ro vận chuyển</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                <span>Hướng dẫn kỹ thuật dưỡng nước và thuần cá</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            borderTop: '1px solid #1e293b',
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          &copy; {new Date().getFullYear()} AquaCraft. Tất cả quyền được bảo lưu.
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <FloatingActions />
    </div>
  );
}
