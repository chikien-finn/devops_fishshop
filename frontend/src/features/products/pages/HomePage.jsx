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
  Check,
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
  const { cart, addToCart } = useCart();

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

  const slides = [
    {
      id: 1,
      farmImg: '/banner_farm.jpg?v=3',
      eyebrow: 'Trang trại sinh vật cảnh',
      title: 'Mô hình trang trại nuôi cá cảnh',
      bulletPoints: [
        'Trang trại xây dựng theo mô hình thủy sinh hiện đại',
        'Cá được chăm sóc và dưỡng khỏe mạnh trong nước sạch',
        'Nguồn thức ăn tự nhiên giàu dinh dưỡng',
        'Sinh sản và tuyển chọn con giống thuần chủng',
        'Kiểm tra sức khỏe nghiêm ngặt trước khi xuất giao',
      ],
    },
    {
      id: 2,
      farmImg: '/banner_fish.jpg?v=2',
      eyebrow: 'Tuyển chọn giống cá',
      title: 'Hệ thống cá cảnh thuần chủng',
      bulletPoints: [
        'Hơn 50 giống cá nhiệt đới và thủy sinh tuyển chọn',
        'Quy trình cách ly và kiểm dịch tiêu chuẩn',
        'Hỗ trợ đóng bao oxy chuyển phát nhanh 48h toàn quốc',
        'Tư vấn kỹ thuật setup hồ và dưỡng nước miễn phí',
        'Cam kết cá khỏe mạnh 100% khi nhận hàng',
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
          subCategory: targetFish.subCategory,
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
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          type="button"
          disabled={isLoadingMore}
          onClick={() =>
            remaining > 0 ? handleLoadMore(sectionKey, total) : handleCollapseSection(sectionKey)
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#334155',
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: isLoadingMore ? 'wait' : 'pointer',
            opacity: isLoadingMore ? 0.7 : 1,
            transition: 'background-color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          {isLoadingMore ? (
            <span>Đang tải...</span>
          ) : remaining > 0 ? (
            <>
              <span>Xem thêm</span>
              <ChevronDown size={15} />
            </>
          ) : (
            <>
              <span>Thu gọn</span>
              <ChevronUp size={15} />
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
    const maxStock = typeof p.stock === 'number' ? Math.max(0, p.stock) : 25;
    if (maxStock <= 0) {
      setToastMessage(`Sản phẩm "${p.name}" đã hết hàng!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const existing = cart?.find((c) => String(c._id || c.id) === String(p._id || p.id));
    const inCartQty = existing?.quantity || 0;
    if (inCartQty >= maxStock) {
      setToastMessage(`Bạn đã có tối đa ${maxStock} con "${p.name}" trong giỏ!`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    addToCart({
      _id: p._id || p.id,
      name: p.name,
      price: p.price,
      images: p.gallery && p.gallery.length > 0 ? p.gallery : [p.image],
      category: p.category || 'fish',
      stock: maxStock,
    });
    setToastMessage(`Đã thêm "${p.name}" vào giỏ hàng`);
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
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div>
          {/* Thumbnail Image Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
            }}
          >
            {p.discount && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  padding: '2px 6px',
                  borderRadius: '4px',
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
                src={p.image || '/fish_neon.jpg'}
                alt={p.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/fish_neon.jpg';
                }}
              />
            </Link>

            {/* Quick View Button overlay on hover */}
            <button
              className="thienduc-quickview-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewProduct(p);
              }}
              title="Xem nhanh"
              style={{
                position: 'absolute',
                right: '8px',
                bottom: '8px',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.15s, background-color 0.15s',
                zIndex: 2,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)')}
            >
              <Search size={14} />
            </button>
          </div>

          {/* Product Name */}
          <Link
            to={productDetailUrl}
            style={{ textDecoration: 'none' }}
          >
            <h4
              title={p.name}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#0f172a',
                marginTop: '10px',
                marginBottom: '6px',
                lineHeight: 1.4,
                height: '2.4rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
            >
              {p.name}
            </h4>
          </Link>

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                color: '#0f172a',
                fontSize: '0.9375rem',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {p.priceFormatted}
            </span>
            {p.oldPriceFormatted && (
              <span
                style={{
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  textDecoration: 'line-through',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {p.oldPriceFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '12px' }}>
          {p.soldOut ? (
            <Link
              to={productDetailUrl}
              style={{
                display: 'block',
                width: '100%',
                padding: '7px 0',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#94a3b8',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Hết hàng
            </Link>
          ) : p.actionText === 'CHỌN MUA' ? (
            <button
              onClick={() => handleAddToCart(p)}
              style={{
                width: '100%',
                padding: '7px 0',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
            >
              Chọn mua
            </button>
          ) : (
            <Link
              to={productDetailUrl}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 0',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500,
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Xem chi tiết
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. HERO BANNER / SLIDER */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          overflow: 'hidden',
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
          {/* Left: Farm Photo */}
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
            {/* Prev arrow */}
            <button
              onClick={handlePrevSlide}
              title="Slide trước"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)')}
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Right: Info Card */}
          <div
            style={{
              padding: '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Eyebrow */}
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#0284c7',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              {slides[currentSlide].eyebrow}
            </span>

            {/* Title */}
            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: '16px',
                lineHeight: 1.3,
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
                gap: '8px',
              }}
            >
              {slides[currentSlide].bulletPoints.map((text, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '0.8125rem',
                    color: '#475569',
                    lineHeight: 1.5,
                  }}
                >
                  <Check size={14} color="#0284c7" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Action Link */}
            <div style={{ marginTop: '20px' }}>
              <Link
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  textDecoration: 'none',
                }}
              >
                <span>Xem danh mục cá tuyển chọn</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Next Slide Arrow Button */}
            <button
              onClick={handleNextSlide}
              title="Slide tiếp"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CIRCLES */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '24px 20px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: selectedFish ? '8px' : '0',
            }}
          >
            <Fish color="#0284c7" size={18} />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0f172a' }}>
              Các dòng cá cảnh nổi bật
            </h3>
          </div>
          {selectedFish && (
            <button
              onClick={() => setSelectedFish(null)}
              style={{
                backgroundColor: '#f8fafc',
                color: '#0284c7',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 500,
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
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
                  minWidth: '88px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <img
                    src={fish.image || '/fish_neon.jpg'}
                    alt={fish.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/fish_neon.jpg';
                    }}
                  />
                </div>
                <span
                  style={{
                    marginTop: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#0284c7' : '#334155',
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

      {/* Kết quả lọc theo dòng cá nổi bật */}
      {selectedFish && (
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '24px 20px',
            border: '1px solid #bae6fd',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#0f172a',
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
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Đóng bộ lọc
            </button>
          </div>
          {selectedFishLoading && selectedFishItems.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 0', fontSize: '0.875rem' }}>
              Đang tìm sản phẩm phù hợp...
            </p>
          ) : selectedFishItems.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 0', fontSize: '0.875rem' }}>
              Chưa có sản phẩm nào thuộc dòng này trong kho.
            </p>
          ) : (
            <>
              <div
                className="thienduc-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {selectedFishItems.map((p) => renderProductCard(p))}
              </div>
              {selectedFishItems.length < selectedFishTotal && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    disabled={selectedFishLoading}
                    onClick={() => setSelectedFishPage((prev) => prev + 1)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#0284c7',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
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

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            right: '20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.15)',
            border: '1px solid #334155',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#38bdf8" />
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
        .thienduc-card:hover .thienduc-quickview-btn {
          opacity: 1 !important;
        }
      `}</style>

      {/* 1. CÁ CHUỘT VỆ SINH HỒ */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '24px 20px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Cá chuột vệ sinh hồ
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
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
          borderRadius: '10px',
          padding: '24px 20px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Cá dĩa
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {homeSections.dia.items.slice(0, visibleCounts.dia).map((p) => renderProductCard(p))}
        </div>

        {renderLoadMoreButton('dia', homeSections.dia.total)}
      </section>

      {/* 3. CÁ PHƯỢNG HOÀNG */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '24px 20px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Cá phượng hoàng – Cá cảnh dễ nuôi
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
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
          borderRadius: '10px',
          padding: '24px 20px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
            }}
          >
            Tép thủy sinh
          </h2>
        </div>

        <div
          className="thienduc-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
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
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
              border: '1px solid #e2e8f0',
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
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                <img
                  src={quickViewProduct.image || '/fish_neon.jpg'}
                  alt={quickViewProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/fish_neon.jpg';
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  {quickViewProduct.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                    {quickViewProduct.priceFormatted}
                  </span>
                  {quickViewProduct.oldPriceFormatted && (
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
                      {quickViewProduct.oldPriceFormatted}
                    </span>
                  )}
                  {quickViewProduct.discount && (
                    <span style={{ backgroundColor: '#b91c1c', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                      {quickViewProduct.discount}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                  <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="#0284c7" />
                    <span>Tình trạng: <strong style={{ color: '#0f172a' }}>{quickViewProduct.soldOut ? 'Hết hàng' : 'Còn hàng'}</strong></span>
                  </p>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="#0284c7" />
                    <span>Bảo hành cá khỏe mạnh 100%, đóng oxy chuyển phát an toàn.</span>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!quickViewProduct.soldOut && (
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
                    >
                      <ShoppingBag size={16} />
                      <span>Thêm vào giỏ hàng</span>
                    </button>
                  )}

                  <Link
                    to={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                    onClick={() => setQuickViewProduct(null)}
                    style={{
                      width: '100%',
                      height: '36px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxSizing: 'border-box',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <span>Xem chi tiết đầy đủ</span>
                    <ChevronRight size={14} />
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0, marginBottom: '2px' }}>
              100% Cá khỏe mạnh
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Cách ly kiểm dịch kỹ trước khi xuất bán</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Truck size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0, marginBottom: '2px' }}>
              Đóng gói oxy 48h
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Giao hàng hỏa tốc an toàn toàn quốc</p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeartHandshake size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', margin: 0, marginBottom: '2px' }}>
              Bảo hành 1 đổi 1
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Đảm bảo quyền lợi khách hàng tối đa</p>
          </div>
        </div>
      </section>
    </div>
  );
}
