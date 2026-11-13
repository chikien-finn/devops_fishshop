import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Fish,
  ShoppingBag,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Phone,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Sparkles,
  Droplets,
  Thermometer,
  Utensils,
  Compass,
} from 'lucide-react';
import { useCart } from '../../cart/hooks/useCart.jsx';
import { thienducSections } from '../data/thienducSections.js';
import { collectionsData } from '../data/collectionsData.js';
import productService, { isRequestCanceled } from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { formatCatalogProduct } from '../utils/productMapper.js';
import ProductReviews from '../../reviews/components/ProductReviews.jsx';

// Flatten all thienduc and collection products for fast lookup
function getAllThienducProducts() {
  const all = [];
  if (thienducSections.chuot) all.push(...thienducSections.chuot);
  if (thienducSections.dia) all.push(...thienducSections.dia);
  if (thienducSections.phuonghoang) all.push(...thienducSections.phuonghoang);
  if (thienducSections.thuysinh) {
    if (thienducSections.thuysinh.tep) all.push(...thienducSections.thuysinh.tep);
    if (thienducSections.thuysinh.cauvong) all.push(...thienducSections.thuysinh.cauvong);
    if (thienducSections.thuysinh.phuonghoang) all.push(...thienducSections.thuysinh.phuonghoang);
  }
  if (collectionsData) {
    Object.values(collectionsData).forEach((col) => {
      if (col.items) all.push(...col.items);
    });
  }
  return all;
}

export default function ProductDetailPage() {
  const { slug, id } = useParams();
  const targetKey = slug || id;
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [toastMessage, setToastMessage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    const controller = new AbortController();

    const loadFromFallback = () => {
      const allThienduc = getAllThienducProducts();
      const found = allThienduc.find(
        (item) => item.slug === targetKey || item.id === targetKey
      );
      if (found) {
        const formatted = formatCatalogProduct(found);
        setProduct(formatted);
        setActiveImage(formatted.image);
        setSelectedSize(formatted.sizes[0]);
        setQuantity(1);
        const related = allThienduc
          .filter((item) => item.category === found.category && item.id !== found.id)
          .slice(0, 5)
          .map(formatCatalogProduct);
        setRelatedProducts(related);
      }
      setLoading(false);
    };

    productService
      .getProductById(targetKey, { signal: controller.signal })
      .then((data) => {
        if (!data) {
          loadFromFallback();
          return;
        }
        const formatted = formatCatalogProduct(data);
        setProduct(formatted);
        setActiveImage(formatted.image);
        setSelectedSize(formatted.sizes[0]);
        setQuantity(1);

        // Fetch only matching related products with small limit from backend DB
        const relatedParams = { limit: 6 };
        if (formatted.subCategory) {
          relatedParams.subCategory = formatted.subCategory;
        } else if (formatted.category) {
          relatedParams.category = formatted.category;
        }

        productService
          .getProducts(relatedParams, { signal: controller.signal })
          .then((res) => {
            const related = res.items
              .map(formatCatalogProduct)
              .filter((item) => item._id !== formatted._id)
              .slice(0, 5);
            setRelatedProducts(related);
          })
          .catch(() => {});

        setLoading(false);
      })
      .catch((err) => {
        if (isRequestCanceled(err)) return;
        loadFromFallback();
      });

    return () => controller.abort();
  }, [targetKey]);

  const handleAddToCart = () => {
    if (!product || product.soldOut) return;
    addToCart(
      {
        _id: product._id || product.id,
        name: selectedSize && selectedSize !== 'Tiêu chuẩn' ? `${product.name} (${selectedSize})` : product.name,
        price: product.price,
        images: [activeImage || product.image],
        category: product.category || 'fish',
        stock: typeof product.stock === 'number' ? product.stock : 25,
      },
      quantity
    );
    setToastMessage(`Đã thêm ${quantity} x "${product.name}" (${selectedSize}) vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate('/cart');
    }, 400);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1240px', margin: '2rem auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <div
          style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.95rem' }}>Đang tải thông tin chi tiết cá cảnh...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: '1240px', margin: '3rem auto', textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
          Không tìm thấy thông tin sản phẩm
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Sản phẩm có thể đã được cập nhật hoặc tạm ngừng kinh doanh.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '0.65rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
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

      {/* Breadcrumb Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          color: '#64748b',
          padding: '0.5rem 0',
        }}
      >
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>
          {product.categoryName || 'Cá Cảnh'}
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Product Info Section */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 480px) 1fr',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="product-detail-grid"
        >
          {/* LEFT: Image Gallery */}
          <div>
            {/* Main Image Box */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
            >
              {product.discount && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    zIndex: 2,
                  }}
                >
                  {product.discount}
                </span>
              )}

              <img
                src={activeImage || product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>

            {/* Thumbnail Carousel / Row */}
            {product.gallery && product.gallery.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                }}
              >
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activeImage === imgUrl ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information & Purchase Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title & Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textTransform: 'uppercase',
                    backgroundColor: '#f0f9ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {product.categoryName || 'Cá Cảnh Thuần Chủng'}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: product.soldOut ? '#ef4444' : '#10b981',
                    backgroundColor: product.soldOut ? '#fef2f2' : '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {product.soldOut ? '● Hết hàng tại trại' : '● Còn hàng'}
                </span>
              </div>

              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3,
                  margin: '0.25rem 0',
                }}
              >
                {product.name}
              </h1>

              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Thương hiệu: <strong style={{ color: '#0f172a' }}>AquaCraft</strong> | <span style={{ color: '#059669', fontWeight: 600 }}>Cá khỏe mạnh 100%</span>
              </div>
            </div>

            {/* Price Box */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626' }}>
                {product.priceFormatted}
              </span>
              {product.oldPriceFormatted && (
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {product.oldPriceFormatted}
                </span>
              )}
              {product.discount && (
                <span
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Tiết kiệm {product.discount}
                </span>
              )}
            </div>

            {/* Size / Variant Options (Tùy Chọn Kích Thước) */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Kích Thước: <span style={{ color: '#dc2626' }}>{selectedSize}</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.sizes.map((sz, idx) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #dc2626' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#fef2f2' : '#ffffff',
                          color: isSelected ? '#dc2626' : '#334155',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            {!product.soldOut && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                  Số Lượng:
                </label>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <span
                    style={{
                      width: '48px',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons: MUA NGAY & THÊM VÀO GIỎ */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {product.soldOut ? (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: '0.85rem 1.5rem',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  TẠM HẾT HÀNG TẠI TRẠI
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '0.85rem 1.5rem',
                      border: '2px solid #dc2626',
                      backgroundColor: '#ffffff',
                      color: '#dc2626',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>THÊM VÀO GIỎ HÀNG</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    style={{
                      flex: 1,
                      minWidth: '180px',
                      padding: '0.85rem 1.5rem',
                      border: 'none',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                  >
                    <span>MUA NGAY</span>
                  </button>
                </>
              )}
            </div>

            {/* Service & Guarantee Trust Box */}
            <div
              style={{
                marginTop: '0.5rem',
                border: '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fafaf9',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: '#334155' }}>
                <Truck size={18} color="#0284c7" />
                <span>Đóng gói oxy giao toàn quốc 48H</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: '#334155' }}>
                <ShieldCheck size={18} color="#059669" />
                <span>Bảo hành cá sống 100% khi nhận hàng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: '#334155' }}>
                <HeartHandshake size={18} color="#dc2626" />
                <span>1 đổi 1 nhanh chóng nếu có hao hụt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem', color: '#334155' }}>
                <Phone size={18} color="#f59e0b" />
                <span>Hỗ trợ kỹ thuật: <strong>0332127582</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Habitat Parameters Quick Summary */}
      {product.specs && (
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Droplets size={20} color="#0284c7" />
            <span>Môi Trường Sống Lý Tưởng</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Droplets size={24} color="#0284c7" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>ĐỘ PH</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{product.specs.ph || '6.5 - 7.5'}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Thermometer size={24} color="#f59e0b" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>NHIỆT ĐỘ</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{product.specs.temp || '26 - 28°C'}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Utensils size={24} color="#16a34a" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>THỨC ĂN</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{product.specs.food || 'Cám chìm, trùn chỉ'}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '6px',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Compass size={24} color="#9333ea" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>TẬP TÍNH</span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{product.specs.habit || 'Sống tầng đáy, theo đàn'}</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs: Detailed Description / Care Guide */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('desc')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'desc' ? '3px solid #dc2626' : '3px solid transparent',
              color: activeTab === 'desc' ? '#dc2626' : '#64748b',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.15s',
            }}
          >
            Thông Tin Chi Tiết
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'guide' ? '3px solid #dc2626' : '3px solid transparent',
              color: activeTab === 'guide' ? '#dc2626' : '#64748b',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '-2px',
              transition: 'all 0.15s',
            }}
          >
            Hướng Dẫn Thả & Chăm Sóc Cá Mới
          </button>
        </div>

        {activeTab === 'desc' ? (
          <div
            style={{
              lineHeight: 1.8,
              fontSize: '0.925rem',
              color: '#334155',
            }}
          >
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>Thông tin sản phẩm đang được cập nhật.</p>
            )}
          </div>
        ) : (
          <div style={{ lineHeight: 1.8, fontSize: '0.925rem', color: '#334155' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Quy trình thả cá mới mua vào hồ chuẩn kỹ thuật:
            </h4>
            <ol style={{ paddingLeft: '1.25rem', margin: '0 0 1rem' }}>
              <li><strong>Ngâm cân bằng nhiệt (15 - 20 phút):</strong> Thả nguyên bọc cá vào hồ để nước trong bịch đạt cùng nhiệt độ với hồ nuôi.</li>
              <li><strong>Pha nước làm quen (10 phút):</strong> Mở bịch, múc từng ít nước hồ cho vào bịch (khoảng 30% thể tích bịch) để cá thích nghi dần với độ pH và môi trường nước mới.</li>
              <li><strong>Vớt cá vào hồ:</strong> Dùng vợt vớt nhẹ nhàng cá cho vào hồ nuôi, đổ phần nước trong bọc đi, không đổ trực tiếp nước bọc cá vào hồ.</li>
              <li><strong>Chăm sóc 24h đầu:</strong> Tắt đèn hồ hoặc để đèn mờ, không cho ăn trong 24 giờ đầu để cá nghỉ ngơi và hồi phục sức khỏe sau quãng đường vận chuyển.</li>
            </ol>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#0284c7' }}>
              💡 Mọi thắc mắc kỹ thuật nuôi, xử lý nước hoặc phòng trị nấm bệnh, quý khách vui lòng liên hệ Zalo 0332127582 để được kỹ thuật viên hỗ trợ miễn phí!
            </p>
          </div>
        )}
      </section>

      <ProductReviews productId={product._id} />

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
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
            <h3
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Sản Phẩm Cùng Danh Mục
            </h3>
          </div>

          <div
            className="thienduc-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {relatedProducts.map((p) => (
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
              >
                <div>
                  <Link
                    to={`/products/${p.slug || p.id}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1/1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#f8fafc',
                      display: 'block',
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

                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>

                  <Link
                    to={`/products/${p.slug || p.id}`}
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
                      }}
                    >
                      {p.name}
                    </h4>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
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

                <div style={{ marginTop: '0.65rem' }}>
                  <Link
                    to={`/products/${p.slug || p.id}`}
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
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 1024px) {
          .thienduc-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}

