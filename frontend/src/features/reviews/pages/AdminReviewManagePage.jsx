import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Star,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import reviewApi from '../services/reviewApi.js';
import StarRating from '../components/StarRating.jsx';
import Pagination from '../../../components/common/Pagination.jsx';
import { formatCurrency } from '../../../utils/formatters.js';

export default function AdminReviewManagePage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 5.0,
    fiveStarCount: 0,
    lowStarCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, review: null });
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const fetchReviews = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await reviewApi.getAllReviewsAdmin({
          page,
          limit: 10,
          search: search.trim() || undefined,
          rating: ratingFilter || undefined,
        });

        setReviews(res.items || []);
        if (res.pagination) setPagination(res.pagination);
        if (res.stats) setStats(res.stats);
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Không thể tải danh sách đánh giá');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, ratingFilter]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRatingFilter('');
    setPage(1);
  };

  const handleDeleteClick = (review) => {
    setConfirmModal({ isOpen: true, review });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.review) return;
    const reviewId = confirmModal.review._id;
    setDeletingId(reviewId);

    try {
      await reviewApi.deleteReviewAdmin(reviewId);
      showToast('success', 'Đã xóa và gỡ bỏ đánh giá thành công');
      setConfirmModal({ isOpen: false, review: null });
      fetchReviews();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Không thể xóa đánh giá');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} color="#0284c7" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Quản Lý Đánh Giá &amp; Bình Luận
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Kiểm duyệt và quản lý toàn bộ nhận xét, số sao đánh giá của khách hàng trên toàn bộ các dòng cá cảnh.
          </p>
        </div>

        <button
          onClick={() => fetchReviews(true)}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 0.875rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Đang tải…' : 'Làm mới dữ liệu'}</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toast.message && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: toast.type === 'error' ? '#dc2626' : '#15803d',
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Tổng số đánh giá
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {stats.total.toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>lượt</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>Từ khách hàng đã mua</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Điểm trung bình
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {stats.avgRating || 5.0} <Star size={22} fill="#f59e0b" stroke="#f59e0b" />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Độ hài lòng chung</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Đánh giá 5 sao ★★★★★
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {stats.fiveStarCount.toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>lượt</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Rất tích cực</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Cần lưu ý (1-2 sao)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats.lowStarCount > 0 ? '#dc2626' : '#64748b', marginTop: '0.35rem' }}>
            {stats.lowStarCount.toLocaleString()} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>lượt</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: stats.lowStarCount > 0 ? '#dc2626' : '#64748b', marginTop: '0.25rem' }}>
            {stats.lowStarCount > 0 ? 'Cần kiểm tra phản ánh' : 'Không có phản ánh tiêu cực'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: '1',
            minWidth: '260px',
            maxWidth: '480px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              gap: '0.5rem',
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nội dung nhận xét…"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0.45rem 0.875rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Tìm
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b' }}>
            <Filter size={15} />
            <span>Mức sao:</span>
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Tất cả số sao</option>
            <option value="5">5 sao (Tuyệt vời)</option>
            <option value="4">4 sao (Hài lòng)</option>
            <option value="3">3 sao (Bình thường)</option>
            <option value="2">2 sao (Chưa tốt)</option>
            <option value="1">1 sao (Kém)</option>
          </select>

          {(search || ratingFilter) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Khách hàng</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Sản phẩm / Cá cảnh</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Đánh giá</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Nội dung bình luận</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Ngày gửi</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Đang tải danh sách đánh giá...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageSquare size={32} color="#cbd5e1" />
                      <strong>Không tìm thấy đánh giá nào</strong>
                      <span style={{ fontSize: '0.8125rem' }}>Hãy thử điều chỉnh lại từ khóa hoặc bộ lọc số sao.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const customerName = rev.user?.name || 'Khách hàng';
                  const customerEmail = rev.user?.email || '';
                  const productName = rev.product?.name || 'Sản phẩm đã gỡ';
                  const productImg = rev.product?.images?.[0] || '/logo.png';
                  const productSlug = rev.product?.slug || '';

                  return (
                    <tr
                      key={rev._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      {/* Khách hàng */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                              flexShrink: 0,
                            }}
                          >
                            {customerName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{customerName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customerEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <img
                            src={productImg}
                            alt={productName}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              border: '1px solid #e2e8f0',
                            }}
                            onError={(e) => (e.currentTarget.src = '/logo.png')}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {productName}
                            </div>
                            {rev.product?._id && (
                              <Link
                                to={`/products/${rev.product._id}`}
                                target="_blank"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.75rem',
                                  color: '#0284c7',
                                  textDecoration: 'none',
                                }}
                              >
                                <span>Xem trên shop</span>
                                <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Đánh giá sao */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <StarRating rating={rev.rating} readOnly size={15} />
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {rev.rating}/5 sao
                        </div>
                      </td>

                      {/* Nội dung nhận xét */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', maxWidth: '300px' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.45 }}>
                          {rev.comment || <em style={{ color: '#94a3b8' }}>Khách hàng chỉ chấm sao không để lại lời bình.</em>}
                        </p>
                      </td>

                      {/* Ngày gửi */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.8125rem', color: '#64748b' }}>
                        {new Date(rev.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteClick(rev)}
                          disabled={deletingId === rev._id}
                          title="Xóa đánh giá này"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fee2e2',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination.totalItems > pagination.limit && (
          <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <Pagination
              currentPage={pagination.page}
              totalItems={pagination.totalItems}
              pageSize={pagination.limit}
              onPageChange={(p) => setPage(p)}
              itemLabel="đánh giá"
            />
          </div>
        )}
      </div>

      {/* Modal Xác Nhận Xóa Đánh Giá */}
      {confirmModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                Xác nhận gỡ bỏ đánh giá?
              </h3>
            </div>

            <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa đánh giá của khách hàng{' '}
              <strong>{confirmModal.review?.user?.name || 'Khách hàng'}</strong> cho sản phẩm{' '}
              <strong>{confirmModal.review?.product?.name || 'Cá cảnh'}</strong>? Hành động này không thể hoàn tác.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, review: null })}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                {deletingId ? 'Đang xóa…' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
