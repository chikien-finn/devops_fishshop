import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Fish, Droplets, ShoppingBag, Sparkles } from 'lucide-react';
import productService from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import { useCart } from '../../cart/hooks/useCart.jsx';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const searchQuery = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    setLoading(true);
    productService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((item) => {
    const searchTerms = searchQuery
      ? searchQuery.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const matchesSearch =
      searchTerms.length === 0 ||
      searchTerms.some(
        (term) =>
          item.name.toLowerCase().includes(term) ||
          (item.description && item.description.toLowerCase().includes(term))
      );

    const matchesCategory =
      currentCategory === 'all' || item.category === currentCategory;

    return matchesSearch && matchesCategory;
  });

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
              {searchQuery
                ? `Kết quả tìm kiếm cho: "${searchQuery}"`
                : 'Khám phá các giống cá Betta, Cá Dĩa, Cá Biển và cây thủy sinh được tuyển chọn kỹ lưỡng.'}
            </p>
          </div>

          {/* Quick Filter Buttons */}
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
                  const newParams = new URLSearchParams(searchParams);
                  if (tab.id === 'all') {
                    newParams.delete('category');
                  } else {
                    newParams.set('category', tab.id);
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
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
          <Fish size={40} color="#0284c7" style={{ margin: '0 auto 1rem', display: 'block' }} />
          Đang tải danh sách cá cảnh & thủy sinh...
        </div>
      ) : filteredProducts.length === 0 ? (
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
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
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ height: '180px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
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
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                  {item.description || 'Chưa có mô tả chi tiết.'}
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
    </div>
  );
}
