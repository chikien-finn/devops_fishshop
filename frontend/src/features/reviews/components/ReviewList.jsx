import { useState, useMemo } from 'react';
import { MessageSquareText, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import StarRating from './StarRating.jsx';
import Pagination from '../../../components/common/Pagination.jsx';

/**
 * Component ReviewList: Danh sách đánh giá khách hàng đặt dưới chi tiết cá
 */
export default function ReviewList({
  reviews = [],
  summary = { count: 0, average: 0 },
  loading = false,
  pagination = { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  onPageChange,
}) {
  const [selectedStarFilter, setSelectedStarFilter] = useState(0); // 0: Tất cả

  // Tính tỷ lệ các mức sao
  const starBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Lọc đánh giá theo số sao được chọn
  const filteredReviews = useMemo(() => {
    if (!selectedStarFilter) return reviews;
    return reviews.filter((r) => Math.round(r.rating) === selectedStarFilter);
  }, [reviews, selectedStarFilter]);

  const avatarColors = [
    '#0284c7', // Sky Blue
    '#16a34a', // Emerald Green
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0d9488', // Teal
  ];

  const getAvatarColor = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Khối Tổng quan Đánh giá & Phân bổ sao */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
        }}
      >
        {/* Cột 1: Điểm trung bình */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            paddingRight: '1rem',
            borderRight: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {summary.average ? Number(summary.average).toFixed(1) : '5.0'}
          </div>
          <div style={{ marginTop: '0.5rem', marginBottom: '0.35rem' }}>
            <StarRating rating={Math.round(summary.average || 5)} readOnly size={22} />
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Dựa trên <strong>{summary.count || reviews.length}</strong> đánh giá thực tế
          </div>
        </div>

        {/* Cột 2: Phân bổ sao (Progress Bars) */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starBreakdown[star] || 0;
            const total = reviews.length || 1;
            const percent = reviews.length > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 0 : star)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  backgroundColor: selectedStarFilter === star ? '#e2e8f0' : 'transparent',
                }}
              >
                <span style={{ width: '40px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>
                  {star} sao
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      backgroundColor: star >= 4 ? '#f59e0b' : '#94a3b8',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ width: '32px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bộ lọc số sao */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b', marginRight: '0.25rem' }}>
          <Filter size={15} />
          <span>Lọc theo:</span>
        </div>

        {[
          { label: 'Tất cả', value: 0 },
          { label: '5 sao ★', value: 5 },
          { label: '4 sao ★', value: 4 },
          { label: '3 sao ★', value: 3 },
          { label: '2 sao ★', value: 2 },
          { label: '1 sao ★', value: 1 },
        ].map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => setSelectedStarFilter(btn.value)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: selectedStarFilter === btn.value ? '1px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: selectedStarFilter === btn.value ? '#eff6ff' : '#ffffff',
              color: selectedStarFilter === btn.value ? '#0284c7' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Danh sách từng nhận xét */}
      {loading ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          Đang tải danh sách đánh giá...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <MessageSquareText size={32} color="#94a3b8" />
          <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9375rem' }}>
            {selectedStarFilter > 0
              ? `Chưa có đánh giá nào đạt mức ${selectedStarFilter} sao.`
              : 'Sản phẩm này chưa có đánh giá nào.'}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0, maxWidth: '360px' }}>
            Hãy đặt mua cá cảnh ngay hôm nay để trở thành người đầu tiên chia sẻ cảm nhận trải nghiệm!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReviews.map((review) => {
            const userName = review.user?.name || 'Khách hàng AquaCraft';
            const initial = userName.slice(0, 1).toUpperCase();
            const avatarColor = getAvatarColor(userName);

            return (
              <article
                key={review._id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '1rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: avatarColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>

                {/* Nội dung đánh giá */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                        {userName}
                      </strong>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        <ShieldCheck size={12} />
                        <span>Đã mua hàng</span>
                      </span>
                    </div>

                    <time
                      dateTime={review.createdAt}
                      style={{ fontSize: '0.75rem', color: '#94a3b8' }}
                    >
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </time>
                  </div>

                  {/* Sao */}
                  <div>
                    <StarRating rating={review.rating} readOnly size={16} />
                  </div>

                  {/* Bình luận */}
                  <p
                    style={{
                      margin: '0.35rem 0 0 0',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: '#334155',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {review.comment || 'Khách hàng không để lại nhận xét chi tiết.'}
                  </p>
                </div>
              </article>
            );
          })}

          {/* Phân trang */}
          {pagination.totalItems > pagination.limit && (
            <div style={{ marginTop: '0.5rem' }}>
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.totalItems}
                pageSize={pagination.limit}
                onPageChange={onPageChange}
                itemLabel="đánh giá"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
