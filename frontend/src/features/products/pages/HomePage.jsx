import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Fish,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Search,
  X,
} from 'lucide-react';
import productService, { isRequestCanceled } from '../services/productService.js';
import { useCart } from '../../cart/hooks/useCart.jsx';
import { thienducSections } from '../data/thienducSections.js';
import { collectionsData } from '../data/collectionsData.js';
import { formatCatalogProduct } from '../utils/productMapper.js';

const INITIAL_SECTION_COUNTS = {
  chuot: 10,
  dia: 5,
  phuonghoang: 5,
  tep: 5,
};

const LOAD_MORE_STEP = 5;
const SELECTED_FISH_PAGE_SIZE = 15;

const mergeCatalogItems = (primary = [], extra = []) => {
  const seen = new Set();
  const merged = [];
  for (const item of [...primary, ...extra]) {
    const key = item.slug || item.name || item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
};

const fallbackSections = {
  chuot: mergeCatalogItems(thienducSections.chuot, collectionsData['ca-chuot']?.items),
  dia: mergeCatalogItems(thienducSections.dia, collectionsData['ca-dia']?.items),
  phuonghoang: mergeCatalogItems(thienducSections.phuonghoang, collectionsData['ca-phuong-hoang']?.items),
  tep: mergeCatalogItems(thienducSections.thuysinh.tep, collectionsData.tep?.items),
};

const buildInitialHomeSections = () => ({
  chuot: { items: fallbackSections.chuot, total: fallbackSections.chuot.length, fromDb: false },
  dia: { items: fallbackSections.dia, total: fallbackSections.dia.length, fromDb: false },
  phuonghoang: { items: fallbackSections.phuonghoang, total: fallbackSections.phuonghoang.length, fromDb: false },
  tep: { items: fallbackSections.tep, total: fallbackSections.tep.length, fromDb: false },
});

const mergeUniqueById = (existing, incoming) => {
  const seen = new Set(existing.map((item) => item._id || item.id));
  const next = [...existing];
  for (const item of incoming) {
    const key = item._id || item.id;
    if (!seen.has(key)) {
      seen.add(key);
      next.push(item);
    }
  }
  return next;
};

export default function HomePage() {
  const [homeSections, setHomeSections] = useState(buildInitialHomeSections);
  const [loadingMoreSection, setLoadingMoreSection] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFish, setSelectedFish] = useState(null);
  const [selectedFishItems, setSelectedFishItems] = useState([]);
  const [selectedFishTotal, setSelectedFishTotal] = useState(0);
  const [selectedFishPage, setSelectedFishPage] = useState(1);
  const [selectedFishLoading, setSelectedFishLoading] = useState(false);
  const [visibleCounts, setVisibleCounts] = useState(INITIAL_SECTION_COUNTS);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const { addToCart } = useCart();

  // 8 fish categories exactly as in reference image 2
  const fishCategories = [
    { id: 'neon', name: 'Cá Neon', image: '/fish_neon.jpg?v=2', search: 'Neon', subCategory: 'ca-neon' },
    { id: 'dia', name: 'Cá Dĩa', image: '/fish_dia.jpg?v=2', search: 'Dĩa', subCategory: 'ca-dia' },
    { id: 'thantien', name: 'Cá Thần Tiên', image: '/fish_thantien.jpg?v=2', search: 'Thần Tiên', subCategory: 'ca-than-tien' },
    { id: 'phuonghoang', name: 'Phượng Hoàng', image: '/fish_phuonghoang.jpg?v=2', search: 'Phượng Hoàng', subCategory: 'ca-phuong-hoang' },
    { id: 'cauvong', name: 'Cá Cầu Vồng', image: '/fish_cauvong.jpg?v=2', search: 'Cầu Vồng', subCategory: 'ca-cau-vong' },
    { id: 'ali', name: 'Cá Ali Thái', image: '/fish_ali.jpg?v=2', search: 'Ali', subCategory: 'ca-ali' },
    { id: 'chuot', name: 'Cá Chuột', image: '/fish_chuot.jpg?v=2', search: 'Chuột', subCategory: 'ca-chuot' },
    { id: 'betta', name: 'Cá Betta', image: '/fish_betta.jpg?v=2', search: 'Betta', subCategory: 'ca-betta' },
  ];

  // Banner slides
  const slides = [
    {
      id: 1,
      farmImg: '/banner_farm.jpg?v=3',
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
      farmImg: '/banner_fish.jpg?v=2',
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
    const controller = new AbortController();

    for (const [key, limit] of Object.entries(INITIAL_SECTION_COUNTS)) {
      productService
        .getProducts(
          { sectionGroup: key, page: 1, limit },
          { signal: controller.signal }
        )
        .then((res) => {
          if (!res?.items?.length || !(res.pagination?.totalItems > 0)) return;
          setHomeSections((prev) => ({
            ...prev,
            [key]: {
              items: res.items.map(formatCatalogProduct),
              total: res.pagination.totalItems,
              fromDb: true,
            },
          }));
        })
        .catch((err) => {
          if (!isRequestCanceled(err)) console.error(`Error loading section ${key}:`, err);
        });
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedFish) {
      setSelectedFishItems([]);
      setSelectedFishTotal(0);
      return;
    }

    const targetFish = fishCategories.find((f) => f.id === selectedFish);
    if (!targetFish) return;

    const controller = new AbortController();
    setSelectedFishLoading(true);

    productService
      .getProducts(
        {
          fishSubCategory: targetFish.subCategory,
          fishKeyword: targetFish.search,
          page: selectedFishPage,
          limit: SELECTED_FISH_PAGE_SIZE,
        },
        { signal: controller.signal }
      )
      .then((res) => {
        const formatted = res.items.map(formatCatalogProduct);
        setSelectedFishItems((prev) =>
          selectedFishPage === 1 ? formatted : mergeUniqueById(prev, formatted)
        );
        setSelectedFishTotal(res.pagination.totalItems);
        setSelectedFishLoading(false);
      })
      .catch((err) => {
        if (isRequestCanceled(err)) return;
        console.error(err);
        setSelectedFishLoading(false);
      });

    return () => controller.abort();
  }, [selectedFish, selectedFishPage]);

  const handleLoadMore = async (sectionKey, total) => {
    const currentVisible = visibleCounts[sectionKey] || INITIAL_SECTION_COUNTS[sectionKey];
    const nextVisible = Math.min(currentVisible + LOAD_MORE_STEP, total);
    const sectionState = homeSections[sectionKey];

    if (
      sectionState?.fromDb &&
      sectionState.items.length < nextVisible &&
      sectionState.items.length < sectionState.total
    ) {
      try {
        setLoadingMoreSection(sectionKey);
        const nextPage = Math.floor(sectionState.items.length / LOAD_MORE_STEP) + 1;
        const res = await productService.getProducts({
          sectionGroup: sectionKey,
          page: nextPage,
          limit: LOAD_MORE_STEP,
        });
        const formatted = res.items.map(formatCatalogProduct);
        setHomeSections((prev) => ({
          ...prev,
          [sectionKey]: {
            ...prev[sectionKey],
            items: mergeUniqueById(prev[sectionKey].items, formatted),
            total: res.pagination.totalItems,
          },
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMoreSection(null);
      }
    }

    setVisibleCounts((prev) => ({
      ...prev,
      [sectionKey]: nextVisible,
    }));
  };

  const handleCollapseSection = (sectionKey) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [sectionKey]: INITIAL_SECTION_COUNTS[sectionKey],
    }));
  };

  const renderLoadMoreButton = (sectionKey, total) => {
    const initial = INITIAL_SECTION_COUNTS[sectionKey] || 5;
    const visible = visibleCounts[sectionKey] ?? initial;
    const remaining = Math.max(0, total - visible);
    const canCollapse = remaining === 0 && total > initial;
    const isLoadingMore = loadingMoreSection === sectionKey;

    if (remaining === 0 && !canCollapse) return null;

    return (
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          disabled={isLoadingMore}
          onClick={() =>
            remaining > 0 ? handleLoadMore(sectionKey, total) : handleCollapseSection(sectionKey)
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'transparent',
            border: '1.5px solid #dc2626',
            color: '#dc2626',
            borderRadius: '9999px',
            padding: '0.45rem 1.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isLoadingMore ? 'wait' : 'pointer',
            opacity: isLoadingMore ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#dc2626';
          }}
        >
          {isLoadingMore ? (
            <span>Đang tải...</span>
          ) : remaining > 0 ? (
            <>
              <span>Xem thêm</span>
              <ChevronDown size={16} />
            </>
          ) : (
            <>
              <span>Thu gọn</span>
              <ChevronUp size={16} />
            </>
          )}
        </button>
      </div>
    );
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleFishClick = (fish) => {
    if (selectedFish === fish.id) {
      setSelectedFish(null);
      setSelectedFishPage(1);
    } else {
      setSelectedFish(fish.id);
      setSelectedFishPage(1);
    }
  };

  const handleAddToCart = (p) => {
    if (p.soldOut) return;
    addToCart({
      _id: p._id || p.id,
      name: p.name,
      price: p.price,
      images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.image],
      category: p.category || 'fish',
      stock: typeof p.stock === 'number' ? p.stock : 25,
    });
    setToastMessage(`Đã thêm "${p.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderProductCard = (p) => {
    const productDetailUrl = `/products/${p.slug || p.id}`;

    return (
      <div
        key={p.id}
        className="thienduc-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #f1f5f9',
          padding: '0.625rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#f1f5f9';
        }}
      >
        <div>
          {/* Thumbnail Image Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
            }}
          >
            {p.discount && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  zIndex: 2,
                }}
              >
                {p.discount}
              </span>
            )}

            <Link
              to={productDetailUrl}
              style={{ display: 'block', width: '100%', height: '100%' }}
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Link>

            {/* Quick View Search Icon Overlay (Clicking opens Quick View Modal) */}
            <div
              className="thienduc-search-overlay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewProduct(p);
              }}
              title="Xem nhanh"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                zIndex: 2,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <Search size={16} color="#dc2626" />
              </div>
            </div>
          </div>

          {/* Product Name (Click navigates to Detail Page) */}
          <Link
            to={productDetailUrl}
            style={{ textDecoration: 'none' }}
          >
            <h4
              title={p.name}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: '0.6rem',
                marginBottom: '0.35rem',
                lineHeight: 1.35,
                height: '2.4rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#1e293b')}
            >
              {p.name}
            </h4>
          </Link>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#dc2626', fontSize: '0.95rem', fontWeight: 800 }}>
              {p.priceFormatted}
            </span>
            {p.oldPriceFormatted && (
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                {p.oldPriceFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Luồng TÙY CHỌN click vào chuyển đến trang chi tiết sản phẩm */}
        <div style={{ marginTop: '0.65rem' }}>
          {p.soldOut ? (
            <Link
              to={productDetailUrl}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.4rem 0',
                border: '1px solid #fecaca',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              HẾT HÀNG
            </Link>
          ) : p.actionText === 'CHỌN MUA' ? (
            <button
              onClick={() => handleAddToCart(p)}
              style={{
                width: '100%',
                padding: '0.4rem 0',
                border: '1.5px solid #dc2626',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              CHỌN MUA
            </button>
          ) : (
            <Link
              to={productDetailUrl}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.4rem 0',
                border: '1.5px solid #dc2626',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              TÙY CHỌN
            </Link>
          )}
        </div>
      </div>
    );
  };

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
                    letterSpacing: '1px',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  AQUACRAFT
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

      {/* 2. CATEGORY CIRCLES (8 FISH ITEMS - CENTERED) */}
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: selectedFish ? '0.5rem' : '0',
            }}
          >
            <Fish color="#0284c7" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
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
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Bỏ chọn lọc
            </button>
          )}
        </div>

        {/* 8 Circles Row - Centered with flex */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
            margin: '0 auto',
            maxWidth: '1100px',
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
                  minWidth: '95px',
                  textAlign: 'center',
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
                    backgroundColor: '#ffffff',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      transform: 'scale(1.05)',
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

      {/* Kết quả lọc theo dòng cá nổi bật (khi chọn 1 trong 8 hình tròn) */}
      {selectedFish && (
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.75rem 1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '2px solid #0284c7',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0284c7',
                margin: 0,
              }}
            >
              Kết quả lọc: {fishCategories.find((f) => f.id === selectedFish)?.name} ({selectedFishTotal} sản phẩm)
            </h2>
            <button
              onClick={() => {
                setSelectedFish(null);
                setSelectedFishPage(1);
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Đóng bộ lọc
            </button>
          </div>
          {selectedFishLoading && selectedFishItems.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
              Đang tìm sản phẩm phù hợp...
            </p>
          ) : selectedFishItems.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
              Chưa có sản phẩm nào thuộc dòng này trong kho.
            </p>
          ) : (
            <>
              <div
                className="thienduc-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {selectedFishItems.map((p) => renderProductCard(p))}
              </div>
              {selectedFishItems.length < selectedFishTotal && (
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    disabled={selectedFishLoading}
                    onClick={() => setSelectedFishPage((prev) => prev + 1)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: 'transparent',
                      border: '1.5px solid #0284c7',
                      color: '#0284c7',
                      borderRadius: '9999px',
                      padding: '0.45rem 1.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: selectedFishLoading ? 'wait' : 'pointer',
                    }}
                  >
                    <span>
                      {selectedFishLoading
                        ? 'Đang tải...'
                        : `Xem thêm (${selectedFishTotal - selectedFishItems.length} sản phẩm)`}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* 4 PHẦN CÁ CẢNH NỔI BẬT */}
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Responsive 5-column grid style */}
      <style>{`
        @media (min-width: 1024px) {
          .thienduc-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .thienduc-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 639px) {
          .thienduc-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        .thienduc-card:hover .thienduc-search-overlay {
          opacity: 1 !important;
        }
      `}</style>

      {/* 1. CÁ CHUỘT VỆ SINH HỒ */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
            }}
          >
            Cá Chuột Vệ Sinh Hồ
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {homeSections.chuot.items.slice(0, visibleCounts.chuot).map((p) => renderProductCard(p))}
        </div>

        {renderLoadMoreButton('chuot', homeSections.chuot.total)}
      </section>

      {/* 2. CÁ DĨA */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
            }}
          >
            Cá Dĩa
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {homeSections.dia.items.slice(0, visibleCounts.dia).map((p) => renderProductCard(p))}
        </div>

        {renderLoadMoreButton('dia', homeSections.dia.total)}
      </section>

      {/* 3. CÁ PHƯỢNG HOÀNG – CÁ CẢNH DỄ NUÔI */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
            }}
          >
            Cá Phượng Hoàng – Cá Cảnh Dễ Nuôi
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {homeSections.phuonghoang.items.slice(0, visibleCounts.phuonghoang).map((p) => renderProductCard(p))}
        </div>

        {renderLoadMoreButton('phuonghoang', homeSections.phuonghoang.total)}
      </section>

      {/* 4. TÉP THỦY SINH */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: 0,
            }}
          >
            Tép Thủy Sinh
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {homeSections.tep.items
            .slice(0, visibleCounts.tep)
            .map((p) => renderProductCard(p))}
        </div>

        {renderLoadMoreButton('tep', homeSections.tep.total)}
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
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
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '220px', height: '220px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {quickViewProduct.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>
                    {quickViewProduct.priceFormatted}
                  </span>
                  {quickViewProduct.oldPriceFormatted && (
                    <span style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      {quickViewProduct.oldPriceFormatted}
                    </span>
                  )}
                  {quickViewProduct.discount && (
                    <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      {quickViewProduct.discount}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  <p style={{ margin: '0 0 0.25rem' }}>✓ Tình trạng: <strong>{quickViewProduct.soldOut ? 'Hết hàng' : 'Còn hàng'}</strong></p>
                  <p style={{ margin: 0 }}>✓ Bảo hành cá khỏe mạnh 100%, đóng oxy chuyển phát an toàn.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!quickViewProduct.soldOut && (
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ShoppingBag size={18} />
                      <span>Thêm Vào Giỏ Hàng</span>
                    </button>
                  )}

                  <Link
                    to={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem',
                      border: '1.5px solid #0284c7',
                      backgroundColor: '#f0f9ff',
                      color: '#0284c7',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span>Xem Chi Tiết Đầy Đủ</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

