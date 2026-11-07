import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fish, Droplets, ShoppingBag } from 'lucide-react';
import productService from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#0f172a',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Fish color="#0284c7" /> Sinh vật cảnh & Thủy sinh cao cấp
        </h1>
        <p style={{ color: '#64748b' }}>
          Khám phá các giống cá Betta, Cá Dĩa, Cá Biển và cây thủy sinh được tuyển chọn kỹ lưỡng.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Đang tải danh sách cá cảnh & thủy sinh...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Chưa có sản phẩm nào được mở bán.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {products.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: '180px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
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
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Droplets
                    size={13}
                    color={item.waterType === 'saltwater' ? '#2563eb' : '#059669'}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {item.waterType === 'saltwater' ? 'Cá biển (Nước mặn)' : 'Nước ngọt'}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '0.5rem',
                    lineHeight: 1.4,
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
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7' }}>
                    {formatCurrency(item.price)}
                  </span>

                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.375rem 0.625rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      color: '#0f172a',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
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
