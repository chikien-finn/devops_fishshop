import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Fish,
  Droplets,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import productService from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { useCart } from '../../cart/hooks/useCart.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFish, setSelectedFish] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 8 fish categories exactly as in reference image 2
  const fishCategories = [
    { id: 'neon', name: 'Cá Neon', image: '/fish_neon.jpg', search: 'Neon' },
    { id: 'dia', name: 'Cá Dĩa', image: '/fish_dia.jpg', search: 'Dĩa' },
    { id: 'thantien', name: 'Cá Thần Tiên', image: '/fish_thantien.jpg', search: 'Thần Tiên' },
    { id: 'phuonghoang', name: 'Phượng Hoàng', image: '/fish_phuonghoang.jpg', search: 'Phượng Hoàng' },
    { id: 'cauvong', name: 'Cá Cầu Vồng', image: '/fish_cauvong.jpg', search: 'Cầu Vồng' },
    { id: 'ali', name: 'Cá Ali Thái', image: '/fish_ali.jpg', search: 'Ali' },
    { id: 'chuot', name: 'Cá Chuột', image: '/fish_chuot.jpg', search: 'Chuột' },
    { id: 'betta', name: 'Cá Betta', image: '/fish_betta.jpg', search: 'Betta' },
  ];

  // Banner slides
  const slides = [
    {
      id: 1,
      farmImg: '/banner_farm.jpg',
      title: 'MÔ HÌNH TRANG TRẠI NUÔI CÁ',
      bulletPoints: [
        'Trang trại xây dựng theo mô hình hiện đại',
        'Cá được chăm sóc và nuôi dưỡng khỏe mạnh',
        'Nguồn thức ăn từ tự nhiên',
        'Cá sinh sản, nuôi dưỡng đúng kỹ thuật',
        'Quy trình chọn cá và kiểm tra kỹ càng trước khi xuất đi',
      ],
    },
    {
      id: 2,
      farmImg: '/banner_full.jpg',
      title: 'HỆ THỐNG CÁ CẢNH THUẦN CHỦNG',
      bulletPoints: [
        'Hơn 50 giống cá cảnh nhiệt đới & thủy sinh tuyển chọn',
        'Quy trình cách ly và kiểm dịch nghiêm ngặt',
        'Hỗ trợ đóng bao oxy chuyển phát nhanh 48h toàn quốc',
        'Tư vấn kỹ thuật setup hồ và xử lý nước miễn phí',
        'Cam kết cá sống 100% khi nhận hàng',
      ],
    },
  ];

  useEffect(() => {
    productService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleFishClick = (fish) => {
    if (selectedFish === fish.id) {
      setSelectedFish(null);
    } else {
      setSelectedFish(fish.id);
    }
  };

  // Filter products
  const filteredProducts = products.filter((item) => {
    if (selectedFish) {
      const targetFish = fishCategories.find((f) => f.id === selectedFish);
      if (targetFish) {
        return item.name.toLowerCase().includes(targetFish.search.toLowerCase());
      }
    }
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. HERO BANNER / SLIDER (EXACTLY AS IN IMAGE 2) */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(320px, 1fr)',
            minHeight: '320px',
            alignItems: 'stretch',
          }}
        >
          {/* Left: Farm Collage Photo */}
          <div
            style={{
              position: 'relative',
              backgroundImage: `url(${slides[currentSlide].farmImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f1f5f9',
              minHeight: '280px',
            }}
          >
            {/* Overlay arrow left */}
            <button
              onClick={handlePrevSlide}
              title="Slide trước"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: '1px solid #cbd5e1',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Right: Info Card with Logo & Bullet Points */}
          <div
            style={{
              padding: '2rem 2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Logo in the banner */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <img
                src="/logo.png"
                alt="AquaCraft"
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '1.5px',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  AQUACRAFT
                </span>
                <span
                  style={{
                    fontSize: '0.625rem',
                    letterSpacing: '3px',
                    color: '#64748b',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  AQUARIUM
                </span>
              </div>
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {slides[currentSlide].title}
            </h2>

            {/* Bullet points */}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {slides[currentSlide].bulletPoints.map((text, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#334155',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Next Slide Arrow Button */}
            <button
              onClick={handleNextSlide}
              title="Slide tiếp"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: '1px solid #cbd5e1',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CIRCLES (8 FISH ITEMS EXACTLY AS IN IMAGE 2) */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Fish color="#0284c7" size={24} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              CÁC DÒNG CÁ CẢNH NỔI BẬT
            </h3>
          </div>
          {selectedFish && (
            <button
              onClick={() => setSelectedFish(null)}
              style={{
                backgroundColor: '#eff6ff',
                color: '#0284c7',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Bỏ chọn lọc
            </button>
          )}
        </div>

        {/* 8 Circles Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          {fishCategories.map((fish) => {
            const isSelected = selectedFish === fish.id;
            return (
              <div
                key={fish.id}
                onClick={() => handleFishClick(fish)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: isSelected ? '3px solid #0284c7' : '3px solid #e2e8f0',
                    boxShadow: isSelected
                      ? '0 6px 14px rgba(2, 132, 199, 0.35)'
                      : '0 3px 6px rgba(0,0,0,0.06)',
                    backgroundColor: '#0f172a',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(2, 132, 199, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.06)';
                    }
                  }}
                >
                  <img
                    src={fish.image}
                    alt={fish.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <span
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#0284c7' : '#1e293b',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fish.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. PRODUCT CATALOG (FETCHED LIVE FROM MONGO ONLINE) */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header & Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '2px solid #f1f5f9',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={20} color="#eab308" />
              <span>SẢN PHẨM & CÁ CẢNH MỚI NHẤT</span>
            </h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Dữ liệu đồng bộ trực tiếp từ hệ sinh thái AquaCraft
            </span>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'fish', label: 'Cá cảnh' },
              { id: 'plant', label: 'Cây thủy sinh' },
              { id: 'food', label: 'Thức ăn & Phụ kiện' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSelectedFish(null);
                }}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: activeCategory === tab.id && !selectedFish ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: activeCategory === tab.id && !selectedFish ? '#0284c7' : '#ffffff',
                  color: activeCategory === tab.id && !selectedFish ? '#ffffff' : '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            <Fish size={36} color="#0284c7" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
            <p>Đang tải danh sách cá cảnh & thủy sinh từ máy chủ...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <p>Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Product Image */}
                <div style={{ height: '180px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      <Fish size={40} />
                    </div>
                  )}

                  {/* Water type badge */}
                  {item.waterType && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: item.waterType === 'saltwater' ? '#1e40af' : '#065f46',
                        color: '#ffffff',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {item.waterType === 'saltwater' ? 'Cá biển' : 'Nước ngọt'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '0.4rem',
                      lineHeight: 1.35,
                      minHeight: '2.7em',
                    }}
                  >
                    {item.name}
                  </h4>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description || 'Giống cá cảnh khỏe mạnh, màu sắc rực rỡ, thích hợp cho hồ thủy sinh gia đình.'}
                  </p>

                  {/* Price & Action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '0.75rem',
                      marginTop: 'auto',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                      {formatCurrency(item.price)}
                    </span>

                    <button
                      onClick={() => addToCart(item, 1)}
                      title="Thêm vào giỏ hàng"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                    >
                      <ShoppingBag size={14} />
                      <span>Mua</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. VALUE PROPOSITION / TRUST BADGES */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>100% Cá Khỏe Mạnh</h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Cách ly kiểm dịch kỹ trước khi xuất bán</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Truck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Đóng Gói Oxy 48H</h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Giao hàng hỏa tốc an toàn toàn quốc</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartHandshake size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Bảo Hành 1 Đổi 1</h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Đảm bảo quyền lợi khách hàng tối đa</p>
          </div>
        </div>
      </section>
    </div>
  );
}

