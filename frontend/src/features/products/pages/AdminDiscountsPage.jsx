import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgePercent,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit2,
  X,
  Check,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { productService, clearProductCache } from '../services/productService.js';
import { formatCurrency } from '../../../utils/formatters.js';
import Pagination from '../../../components/common/Pagination.jsx';

export default function AdminDiscountsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('discounted'); // 'all' | 'discounted' | 'normal'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMode, categoryFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [inputOldPrice, setInputOldPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('17');
  const [inputSalePrice, setInputSalePrice] = useState('');
  const [formError, setFormError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tải danh sách toàn bộ sản phẩm
  const fetchProducts = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      clearProductCache();
      const res = await productService.getProducts(
        { limit: 200 },
        { useCache: false }
      );
      setProducts(res.items || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      showToast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    let discountedCount = 0;
    let maxPct = 0;
    let totalDiscountAmount = 0;

    products.forEach((p) => {
      const isDiscounted = p.oldPrice && p.oldPrice > p.price;
      if (isDiscounted) {
        discountedCount++;
        const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        if (pct > maxPct) maxPct = pct;
        totalDiscountAmount += p.oldPrice - p.price;
      }
    });

    return {
      discountedCount,
      totalCount: products.length,
      maxPct,
      totalDiscountAmount,
    };
  }, [products]);

  // Danh sách đã lọc
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tìm kiếm theo tên
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchCat = (p.categoryName || '').toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      // Lọc danh mục
      if (categoryFilter !== 'all' && p.subCategory !== categoryFilter) {
        return false;
      }

      // Lọc trạng thái giảm giá
      const isDiscounted = p.oldPrice && p.oldPrice > p.price;
      if (filterMode === 'discounted') return isDiscounted;
      if (filterMode === 'normal') return !isDiscounted;

      return true;
    });
  }, [products, search, filterMode, categoryFilter]);

  // Phân trang sản phẩm
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Mở modal tạo mới hoặc chỉnh sửa giảm giá
  const handleOpenModal = (product = null) => {
    setFormError('');
    if (product) {
      setSelectedProduct(product);
      const oldP = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price;
      const saleP = product.price;
      setInputOldPrice(String(oldP));
      setInputSalePrice(String(saleP));

      if (product.oldPrice && product.oldPrice > product.price) {
        const pct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        setDiscountPercent(String(pct));
      } else {
        setDiscountPercent('17');
        const calcSale = Math.round((oldP * (1 - 0.17)) / 1000) * 1000;
        setInputSalePrice(String(calcSale));
      }
    } else {
      setSelectedProduct(null);
      setProductSearch('');
      setInputOldPrice('');
      setDiscountPercent('17');
      setInputSalePrice('');
    }
    setIsModalOpen(true);
  };

  // Khi chọn sản phẩm từ dropdown trong modal
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    const oldP = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price;
    setInputOldPrice(String(oldP));

    const pct = Number(discountPercent) || 17;
    const calcSale = Math.round((oldP * (1 - pct / 100)) / 1000) * 1000;
    setInputSalePrice(String(calcSale));
  };

  // Khi thay đổi % giảm giá -> tự động tính lại giá bán
  const handleDiscountPercentChange = (val) => {
    setDiscountPercent(val);
    const pct = Number(val);
    const oldP = Number(inputOldPrice);
    if (oldP > 0 && !Number.isNaN(pct)) {
      if (pct > 0 && pct < 100) {
        const calcSale = Math.round((oldP * (1 - pct / 100)) / 1000) * 1000;
        setInputSalePrice(String(calcSale));
      } else if (pct === 0) {
        setInputSalePrice(String(oldP));
      }
    }
  };

  // Khi thay đổi trực tiếp Giá bán sau giảm -> tự động tính lại % giảm
  const handleSalePriceChange = (val) => {
    setInputSalePrice(val);
    const saleP = Number(val);
    const oldP = Number(inputOldPrice);
    if (oldP > 0 && saleP > 0 && saleP < oldP) {
      const pct = Math.round(((oldP - saleP) / oldP) * 100);
      setDiscountPercent(String(pct));
    }
  };

  // Khi thay đổi Giá gốc -> tính lại giá bán theo % hiện tại
  const handleOldPriceChange = (val) => {
    setInputOldPrice(val);
    const oldP = Number(val);
    const pct = Number(discountPercent) || 0;
    if (oldP > 0 && pct > 0 && pct < 100) {
      const calcSale = Math.round((oldP * (1 - pct / 100)) / 1000) * 1000;
      setInputSalePrice(String(calcSale));
    }
  };

  // Lưu áp dụng giảm giá
  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct) {
      setFormError('Vui lòng chọn sản phẩm cần giảm giá');
      return;
    }

    const oldP = Number(inputOldPrice);
    const saleP = Number(inputSalePrice);
    const pct = Number(discountPercent);

    if (!oldP || oldP <= 0) {
      setFormError('Giá gốc phải lớn hơn 0');
      return;
    }
    if (!saleP || saleP <= 0) {
      setFormError('Giá sau giảm phải lớn hơn 0');
      return;
    }
    if (saleP >= oldP) {
      setFormError('Giá bán sau giảm phải nhỏ hơn Giá gốc niêm yết');
      return;
    }

    const discountText = `-${pct}%`;

    try {
      setSubmitting(true);
      const payload = {
        price: saleP,
        oldPrice: oldP,
        discount: discountText,
      };

      const updated = await productService.updateProduct(selectedProduct._id, payload);
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? { ...p, ...payload, ...updated } : p))
      );
      showToast(`Đã áp dụng giảm giá ${discountText} cho sản phẩm ${selectedProduct.name}`);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Lỗi cập nhật giảm giá:', err);
      setFormError(err.response?.data?.message || 'Không thể cập nhật giảm giá sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  // Hủy giảm giá (1-Click) -> Hoàn giá về giá gốc và xóa badge
  const handleRemoveDiscount = async (product) => {
    const originalPrice = product.oldPrice || product.price;
    if (!window.confirm(`Bạn có chắc muốn hủy giảm giá cho sản phẩm "${product.name}"? Giá sẽ được hoàn lại mức gốc ${formatCurrency(originalPrice)}.`)) {
      return;
    }

    try {
      const payload = {
        price: originalPrice,
        oldPrice: null,
        discount: '',
      };
      await productService.updateProduct(product._id, payload);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, ...payload } : p))
      );
      showToast(`Đã hủy giảm giá cho ${product.name}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể hủy giảm giá', 'error');
    }
  };

  // Danh sách cá khi tìm kiếm trong modal
  const selectableProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 30);
    const q = productSearch.trim().toLowerCase();
    return products.filter((p) => (p.name || '').toLowerCase().includes(q)).slice(0, 30);
  }, [products, productSearch]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#0284c7',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Button */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <BadgePercent size={22} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Quản Lý Giảm Giá Sản Phẩm (Flash Sale)
            </h1>
          </div>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Thiết lập giá gốc, % giảm giá và hiển thị nhãn khuyến mãi (-17%, -20%...) trực tiếp trên từng con cá.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
            }}
          >
            <Plus size={16} />
            <span>+ Thiết Lập Giảm Giá Cá</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>ĐANG GIẢM GIÁ (FLASH SALE)</span>
            <Flame size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', marginTop: '0.3rem' }}>
            {stats.discountedCount}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
              / {stats.totalCount} sản phẩm
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Có nhãn % giảm giá màu đỏ ngoài shop</div>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0284c7', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>MỨC GIẢM SÂU NHẤT</span>
            <TrendingDown size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '0.3rem' }}>
            {stats.maxPct > 0 ? `-${stats.maxPct}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Mức chiết khấu cao nhất hiện tại</div>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>TỔNG TIỀN TIẾT KIỆM CHO KHÁCH</span>
            <BadgePercent size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.3rem' }}>
            {formatCurrency(stats.totalDiscountAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>Tổng chênh lệch giá gốc và giá bán</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm cá theo tên (Cá Dĩa, Neon, Chuột...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'discounted', label: `Đang giảm giá (${stats.discountedCount})` },
            { id: 'normal', label: `Giá thường (${stats.totalCount - stats.discountedCount})` },
            { id: 'all', label: `Tất cả (${stats.totalCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: filterMode === tab.id ? '1px solid #dc2626' : '1px solid #e2e8f0',
                backgroundColor: filterMode === tab.id ? '#fee2e2' : '#ffffff',
                color: filterMode === tab.id ? '#b91c1c' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {loading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#dc2626' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Đang tải danh sách sản phẩm…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
            <BadgePercent size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
              {filterMode === 'discounted'
                ? 'Chưa có con cá nào đang được giảm giá'
                : 'Không tìm thấy sản phẩm phù hợp'}
            </p>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              {filterMode === 'discounted'
                ? 'Bấm nút "+ Thiết Lập Giảm Giá Cá" để chọn cá và gắn nhãn -17%, -20%...'
                : 'Thử tìm với từ khóa khác hoặc chuyển sang tab Đang giảm giá.'}
            </p>
            {filterMode === 'discounted' && (
              <button
                onClick={() => handleOpenModal()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                + Thiết Lập Giảm Giá Ngay
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Sản Phẩm (Cá Cảnh)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Giá Gốc (Niêm yết)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Mức Giảm (%)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Giá Khuyến Mãi (Bán)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Khách Tiết Kiệm</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => {
                  const isDiscounted = p.oldPrice && p.oldPrice > p.price;
                  const discountPct = isDiscounted
                    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
                    : 0;
                  const saving = isDiscounted ? p.oldPrice - p.price : 0;
                  const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : '/logo.png';

                  return (
                    <tr
                      key={p._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Tên & Ảnh */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                            <img
                              src={img}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                              onError={(e) => (e.currentTarget.src = '/logo.png')}
                            />
                            {isDiscounted && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  padding: '1px 4px',
                                  borderRadius: '4px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }}
                              >
                                -{discountPct}%
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span>{p.categoryName || 'Cá Cảnh'}</span>
                              <Link
                                to={`/products/${p.slug || p._id}`}
                                target="_blank"
                                style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '1px', textDecoration: 'none' }}
                                title="Xem ngoài web"
                              >
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Giá gốc */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        {isDiscounted ? (
                          <span style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatCurrency(p.oldPrice)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>
                            {formatCurrency(p.price)}
                          </span>
                        )}
                      </td>

                      {/* Mức giảm (%) */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        {isDiscounted ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                            }}
                          >
                            <Flame size={13} />
                            <span>-{discountPct}%</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Không giảm</span>
                        )}
                      </td>

                      {/* Giá bán sau giảm */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: isDiscounted ? '#dc2626' : '#0f172a' }}>
                          {formatCurrency(p.price)}
                        </span>
                      </td>

                      {/* Khách tiết kiệm */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        {isDiscounted ? (
                          <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                            +{formatCurrency(saving)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                        {isDiscounted ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                            }}
                          >
                            🔥 Đang Sale
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              backgroundColor: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            Giá niêm yết
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenModal(p)}
                            title="Chỉnh sửa mức giảm giá"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              color: '#0284c7',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={13} />
                            <span>{isDiscounted ? 'Sửa mức giảm' : 'Giảm giá'}</span>
                          </button>

                          {isDiscounted && (
                            <button
                              onClick={() => handleRemoveDiscount(p)}
                              title="Hủy giảm giá, hoàn về giá gốc"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.35rem 0.55rem',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <RotateCcw size={12} />
                              <span>Hủy Sale</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              itemLabel="sản phẩm"
            />
          </div>
        )}
      </div>

      {/* MODAL THIẾT LẬP GIẢM GIÁ */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Thiết Lập Giảm Giá Sản Phẩm (Flash Sale)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDiscount} style={{ padding: '1.25rem 1.5rem' }}>
              {formError && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Chọn cá */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  CHỌN CON CÁ / SẢN PHẨM *
                </label>
                {selectedProduct ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={selectedProduct.images?.[0] || '/logo.png'}
                        alt={selectedProduct.name}
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.src = '/logo.png')}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          {selectedProduct.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Giá hiện tại: <strong>{formatCurrency(selectedProduct.price)}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#64748b',
                      }}
                    >
                      Đổi cá khác
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Gõ để tìm nhanh con cá (VD: Similis, Dĩa, Neon...)"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div
                      style={{
                        maxHeight: '160px',
                        overflowY: 'auto',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      {selectableProducts.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleSelectProduct(p)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.75rem',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'background-color 0.1s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img
                              src={p.images?.[0] || '/logo.png'}
                              alt=""
                              style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
                              onError={(e) => (e.currentTarget.src = '/logo.png')}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
                            {formatCurrency(p.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Thiết lập mức giảm: Giá gốc & % Giảm & Giá sau giảm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {/* Giá gốc */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    GIÁ GỐC NIÊM YẾT *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={inputOldPrice}
                    onChange={(e) => handleOldPriceChange(e.target.value)}
                    placeholder="VD: 100000"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                    Sẽ hiển thị gạch ngang
                  </span>
                </div>

                {/* % Giảm giá */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.35rem' }}>
                    % GIẢM GIÁ *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      placeholder="17"
                      style={{
                        width: '100%',
                        padding: '0.6rem 1.8rem 0.6rem 0.8rem',
                        borderRadius: '6px',
                        border: '2px solid #dc2626',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#dc2626',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        right: '0.6rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#dc2626',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                      }}
                    >
                      %
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.2rem', display: 'block', fontWeight: 600 }}>
                    Badge -{discountPercent || 0}%
                  </span>
                </div>

                {/* Giá bán sau giảm */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    GIÁ BÁN SAU GIẢM *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={inputSalePrice}
                    onChange={(e) => handleSalePriceChange(e.target.value)}
                    placeholder="VD: 83000"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                    Khách thực trả
                  </span>
                </div>
              </div>

              {/* 3. Khung xem trước (Preview) ngoài Web */}
              {selectedProduct && Number(inputOldPrice) > 0 && Number(inputSalePrice) > 0 && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    👁️ XEM TRƯỚC HIỂN THỊ NGOÀI SHOP:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                      <img
                        src={selectedProduct.images?.[0] || '/logo.png'}
                        alt=""
                        style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => (e.currentTarget.src = '/logo.png')}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        -{discountPercent}%
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                        {selectedProduct.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>
                          {formatCurrency(Number(inputSalePrice))}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          {formatCurrency(Number(inputOldPrice))}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '0.1rem' }}>
                        Khách tiết kiệm được {formatCurrency(Number(inputOldPrice) - Number(inputSalePrice))} ({discountPercent}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <Flame size={15} />
                  <span>{submitting ? 'Đang lưu…' : 'Áp Dụng Giảm Giá Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
