import { useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  X,
  ShoppingBag,
  CheckCircle2,
  ArrowUpDown,
  Fish,
} from 'lucide-react';
import { collectionsData } from '../data/collectionsData.js';
import { useCart } from '../../cart/hooks/useCart.jsx';

export default function CollectionPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();

  // Determine collection key from path or slug parameter
  const path = location.pathname.toLowerCase().replace(/^\/collections\//, '').replace(/^\//, '');
  let colKey = slug || path;

  if (colKey.includes('dia')) {
    colKey = 'ca-dia';
  } else if (colKey.includes('chuot')) {
    colKey = 'ca-chuot';
  } else if (colKey.includes('phuong-hoang')) {
    colKey = 'ca-phuong-hoang';
  } else if (colKey.includes('tep')) {
    colKey = 'tep';
  } else {
    colKey = 'ca-chuot';
  }

  const collection = collectionsData[colKey] || collectionsData['ca-chuot'];

  const [sortBy, setSortBy] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddToCart = (p) => {
    if (p.soldOut) return;
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category || 'fish',
      stock: 50,
    });
    setToastMessage(`Đã thêm "${p.name}" vào giỏ hàng!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sort products based on active sort option
  const sortedProducts = useMemo(() => {
    const list = [...collection.items];
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.reverse();
      default:
        return list;
    }
  }, [collection.items, sortBy]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
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

      {/* Breadcrumbs */}
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
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{collection.title}</span>
      </nav>

      {/* Category Header (Exact matching Image 2) */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '2rem 1.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '0.85rem',
            lineHeight: 1.35,
          }}
        >
          {collection.title}
        </h1>

        <p
          style={{
            maxWidth: '920px',
            margin: '0 auto 1.5rem',
            fontSize: '0.925rem',
            color: '#475569',
            lineHeight: 1.65,
          }}
        >
          {collection.description}
        </p>

        {/* Sorting Bar (Exact matching Image 2: Sắp xếp: Tên A → Z, Tên Z → A, Giá tăng dần, Giá giảm dần, Hàng mới) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
            Sắp xếp:
          </span>

          {[
            { id: 'name-asc', label: 'Tên A → Z' },
            { id: 'name-desc', label: 'Tên Z → A' },
            { id: 'price-asc', label: 'Giá tăng dần' },
            { id: 'price-desc', label: 'Giá giảm dần' },
            { id: 'newest', label: 'Hàng mới' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(sortBy === s.id ? 'default' : s.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                border: sortBy === s.id ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                backgroundColor: sortBy === s.id ? '#fef2f2' : '#ffffff',
                color: sortBy === s.id ? '#dc2626' : '#475569',
                fontSize: '0.8125rem',
                fontWeight: sortBy === s.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Responsive 5-column grid style matching Image 2 */}
      <style>{`
        @media (min-width: 1024px) {
          .collection-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .collection-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 639px) {
          .collection-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        .collection-card:hover .collection-search-overlay {
          opacity: 1 !important;
        }
      `}</style>

      {/* Product Catalog Grid (All Products of Collection) */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Hiển thị <strong>{sortedProducts.length}</strong> sản phẩm
          </span>
        </div>

        <div
          className="collection-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {sortedProducts.map((p) => {
            const productDetailUrl = `/products/${p.slug || p.id}`;

            return (
              <div
                key={p.id}
                className="collection-card"
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

                    {/* Quick View Search Icon Overlay */}
                    <div
                      className="collection-search-overlay"
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

                  {/* Product Name (Link to Detail) */}
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

                {/* Action Button */}
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
          })}
        </div>
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
                  <p style={{ margin: 0 }}>✓ Bảo hành cá sống 100%, đóng oxy chuyển phát an toàn.</p>
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
    </div>
  );
}
