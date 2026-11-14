import { useReviews } from '../hooks/useReviews.js';
import ReviewForm from './ReviewForm.jsx';
import ReviewList from './ReviewList.jsx';

/**
 * Component ProductReviews: Container tích hợp Đánh giá sao, Form bình luận và Danh sách review dưới chi tiết cá
 */
export default function ProductReviews({ productId }) {
  const validProductId = /^[a-f\d]{24}$/i.test(String(productId || ''));

  const {
    reviews,
    summary,
    pagination,
    setPage,
    eligibility,
    loading,
    submitting,
    error,
    success,
    submitReview,
  } = useReviews(productId);

  if (!validProductId) return null;

  return (
    <section
      className="product-reviews"
      aria-labelledby="product-reviews-title"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '2rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* Tiêu đề mục */}
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#0284c7',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          TRẢI NGHIỆM THỰC TẾ
        </span>
        <h2
          id="product-reviews-title"
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0.25rem 0 0 0',
          }}
        >
          Đánh giá &amp; Bình luận từ Khách hàng
        </h2>
      </div>

      {/* Form gửi đánh giá (Kiểm tra điều kiện đã mua hàng) */}
      <ReviewForm
        productId={productId}
        eligibility={eligibility}
        onSubmit={submitReview}
        submitting={submitting}
        error={error}
        success={success}
      />

      {/* Danh sách review & Thống kê điểm sao */}
      <ReviewList
        reviews={reviews}
        summary={summary}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
      />
    </section>
  );
}
