import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Fish, ShoppingBag } from 'lucide-react';
import productService, { isRequestCanceled } from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { useCart } from '../../cart/hooks/useCart.jsx';
import { FISH_SUBCATEGORIES, getSubCategoryLabel, stripHtml } from '../utils/productMapper.js';
import Pagination from '../../../components/common/Pagination.jsx';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageSize, setPageSize] = useState(20);
  const { addToCart } = useCart();

  const searchQuery = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentSubCategory = searchParams.get('subCategory') || '';
  const isSaleOnly = searchParams.get('sale') === 'true';
  const currentPage = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (searchQuery) params.search = searchQuery;
    if (currentCategory === 'food') {
      params.categories = 'food,accessory,tank';
    } else if (currentCategory !== 'all') {
      params.category = currentCategory;
    }
    if (currentSubCategory) params.subCategory = currentSubCategory;
    if (isSaleOnly) params.sale = 'true';

    productService
      .getProducts(params, { signal: controller.signal })
      .then((res) => {
        setProducts(res.items);
        setTotalItems(res.pagination.totalItems);
        setLoading(false);
      })
      .catch((err) => {
        if (isRequestCanceled(err)) return;
        console.error(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [searchQuery, currentCategory, currentSubCategory, isSaleOnly, currentPage, pageSize]);

  const updatePageParam = (nextPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', String(nextPage));
    }
    setSearchParams(newParams);
  };

  const subtitleText = searchQuery
    ? `Kết quả tìm kiếm cho "${searchQuery}" (${totalItems} sản phẩm)`
    : isSaleOnly
    ? `Cá & sản phẩm đang giảm giá (${totalItems} sản phẩm)`
    : currentSubCategory
    ? `Danh mục ${getSubCategoryLabel(currentSubCategory)} (${totalItems} sản phẩm)`
    : `Khám phá ${totalItems} dòng cá cảnh Đà Nẵng, thủy sinh và phụ kiện tuyển chọn.`;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Fish color="#0284c7" size={28} />
              <span>Sinh Vật Cảnh & Thủy Sinh AquaCraft</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {subtitleText}
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'fish', label: 'Cá cảnh' },
              { id: 'plant', label: 'Cây thủy sinh' },
              { id: 'food', label: 'Thức ăn & Phụ kiện' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('page');
                  if (tab.id === 'all') {
                    newParams.delete('category');
                    newParams.delete('subCategory');
                    newParams.delete('sale');
                    newParams.delete('search');
                  } else {
                    newParams.set('category', tab.id);
                    if (tab.id !== 'fish') {
                      newParams.delete('subCategory');
                    }
                  }
                  setSearchParams(newParams);
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: currentCategory === tab.id ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: currentCategory === tab.id ? '#0284c7' : '#ffffff',
                  color: currentCategory === tab.id ? '#ffffff' : '#475569',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}

            {(currentCategory === 'all' || currentCategory === 'fish') && (
              <select
                aria-label="Lọc theo dòng cá"
                value={currentSubCategory}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('page');
                  if (e.target.value) {
                    newParams.set('subCategory', e.target.value);
                    newParams.set('category', 'fish');
                  } else {
                    newParams.delete('subCategory');
                  }
                  setSearchParams(newParams);
                }}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '20px',
                  border: currentSubCategory ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">Tất cả dòng cá</option>
                {FISH_SUBCATEGORIES.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
          <Fish size={40} color="#0284c7" style={{ margin: '0 auto 1rem', display: 'block' }} />
          Đang tải danh sách cá cảnh & thủy sinh...
        </div>
      ) : !loading && products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.
          </p>
        </div>
      ) : (
        <>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
            opacity: loading ? 0.55 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {products.map((item) => (
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
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Link
                to={`/products/${item.slug || item._id}`}
                style={{ height: '180px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative', display: 'block' }}
              >
                {item.images && item.images[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    loading="lazy"
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
                    }}
                  >
                    {item.waterType === 'saltwater' ? 'Cá biển' : 'Nước ngọt'}
                  </span>
                )}
                {item.discount && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.discount}
                  </span>
                )}
              </Link>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link
                  to={`/products/${item.slug || item._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '0.4rem',
                      lineHeight: 1.4,
                      minHeight: '2.8em',
                    }}
                  >
                    {item.name}
                  </h3>
                </Link>

                <p
                  style={{
                    fontSize: '0.8125rem',
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
                  {stripHtml(item.description) || 'Chưa có mô tả chi tiết.'}
                </p>

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
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                      {formatCurrency(item.price)}
                    </span>
                    {item.oldPrice > item.price && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          textDecoration: 'line-through',
                          marginLeft: '0.4rem',
                        }}
                      >
                        {formatCurrency(item.oldPrice)}
                      </span>
                    )}
                  </div>

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
        <div style={{ marginTop: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(page) => {
              updatePageParam(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              updatePageParam(1);
            }}
            itemLabel="sản phẩm"
          />
        </div>
        </>
      )}
    </div>
  );
}
