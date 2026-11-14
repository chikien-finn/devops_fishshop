import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CheckCircle, AlertCircle, Send, LogIn } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import StarRating from './StarRating.jsx';

/**
 * Component ReviewForm: Form gửi nhận xét và chọn số sao kèm kiểm tra điều kiện đã mua hàng
 */
export default function ReviewForm({
  productId,
  eligibility = {},
  onSubmit,
  submitting = false,
  error = '',
  success = '',
}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { canReview, hasPurchased, hasReviewed, myReview } = eligibility;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const res = await onSubmit({ rating, comment });
    if (res?.success) {
      setComment('');
      setRating(5);
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        Đang kiểm tra quyền đánh giá...
      </div>
    );
  }

  // Trường hợp 1: Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogIn size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>
              Bạn muốn chia sẻ trải nghiệm về sản phẩm này?
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
              Vui lòng đăng nhập tài khoản khách hàng để viết đánh giá.
            </div>
          </div>
        </div>

        <Link
          to={`/login?redirect=/products/${productId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <LogIn size={15} />
          <span>Đăng nhập ngay</span>
        </Link>
      </div>
    );
  }

  // Trường hợp 2: Đã đánh giá rồi
  if (hasReviewed && myReview) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d' }}>
          <CheckCircle size={18} />
          <strong style={{ fontSize: '0.9375rem' }}>Bạn đã gửi đánh giá cho sản phẩm này</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StarRating rating={myReview.rating} readOnly size={17} />
          <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
            ({new Date(myReview.createdAt).toLocaleDateString('vi-VN')})
          </span>
        </div>
        {myReview.comment && (
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: '#334155',
              fontStyle: 'italic',
            }}
          >
            "{myReview.comment}"
          </p>
        )}
      </div>
    );
  }

  // Trường hợp 3: Đã đăng nhập nhưng chưa từng mua sản phẩm (Điều kiện bắt buộc)
  if (!hasPurchased && !canReview) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShoppingBag size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9375rem' }}>
            Chỉ khách hàng đã mua mới có thể gửi đánh giá
          </div>
          <div style={{ color: '#b45309', fontSize: '0.8125rem', marginTop: '0.15rem' }}>
            Để đảm bảo tính khách quan và chất lượng trải nghiệm thật, hệ thống yêu cầu bạn đã từng đặt mua sản phẩm này trước khi bình luận.
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp 4: Đủ điều kiện gửi đánh giá (Đã mua và chưa đánh giá)
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.25rem',
          }}
        >
          Viết đánh giá của bạn
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
          Chia sẻ cảm nhận về kích cỡ, màu sắc cá hoặc tình trạng sống khi nhận hàng.
        </p>
      </div>

      {/* Chọn số sao */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
          Đánh giá chất lượng:
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          size={24}
          showLabel
        />
      </div>

      {/* Nhập bình luận */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="review-comment-textarea"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}
          >
            Nội dung nhận xét:
          </label>
          <span style={{ fontSize: '0.75rem', color: comment.length > 900 ? '#dc2626' : '#94a3b8' }}>
            {comment.length}/1000 ký tự
          </span>
        </div>
        <textarea
          id="review-comment-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Cá khỏe mạnh, bơi năng động, đóng gói cẩn thận có sục khí..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      </div>

      {/* Thông báo lỗi / thành công */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#16a34a',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'background-color 0.2s',
          }}
        >
          <Send size={15} />
          <span>{submitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}</span>
        </button>
      </div>
    </form>
  );
}
