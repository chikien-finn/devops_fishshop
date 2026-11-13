import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, Star } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.jsx';
import Pagination from '../../../components/common/Pagination.jsx';
import reviewService from '../services/reviewService.js';

const REVIEW_PAGE_SIZE = 10;

function Stars({ value, size = 17 }) {
  return <span className="product-review-stars" aria-label={`${value} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} fill={star <= value ? 'currentColor' : 'none'} />)}
  </span>;
}

export default function ProductReviews({ productId }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const validProductId = /^[a-f\d]{24}$/i.test(String(productId || ''));
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: REVIEW_PAGE_SIZE, totalItems: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReviews = useCallback(async () => {
    if (!validProductId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const result = await reviewService.getProductReviews(productId, { page, limit: REVIEW_PAGE_SIZE });
      setReviews(result.items);
      setSummary(result.summary);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đánh giá sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, [page, productId, validProductId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    let cancelled = false;
    if (authLoading || !isAuthenticated || !validProductId) { setMyReview(null); return undefined; }
    reviewService.getMyReview(productId)
      .then((review) => { if (!cancelled) setMyReview(review); })
      .catch(() => { if (!cancelled) setMyReview(null); });
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, productId, validProductId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const created = await reviewService.createReview(productId, { rating, comment: comment.trim() });
      setMyReview(created);
      setComment('');
      setSuccess('Cảm ơn bạn đã đánh giá sản phẩm.');
      if (page === 1) await loadReviews();
      else setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!validProductId) return null;

  return (
    <section className="product-reviews" aria-labelledby="product-reviews-title">
      <div className="product-reviews-heading">
        <div><span className="product-reviews-eyebrow">CHIA SẺ TRẢI NGHIỆM</span><h2 id="product-reviews-title">Đánh giá &amp; bình luận</h2></div>
        <div className="product-reviews-summary"><Stars value={Math.round(summary.average)} /><strong>{summary.average ? summary.average.toFixed(1) : '0.0'}</strong><span>{summary.count.toLocaleString('vi-VN')} đánh giá</span></div>
      </div>

      {!authLoading && isAuthenticated && !myReview && (
        <form className="product-review-form" onSubmit={handleSubmit}>
          <div><strong>Đánh giá của bạn</strong><div className="product-review-rating-input" role="radiogroup" aria-label="Chọn số sao">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} sao`} onClick={() => setRating(value)}><Star size={23} fill={value <= rating ? 'currentColor' : 'none'} /></button>)}
          </div></div>
          <label htmlFor="product-review-comment">Bình luận (không bắt buộc)</label>
          <textarea id="product-review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={4} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm…" />
          <div className="product-review-form-footer"><span>{comment.length}/1000 ký tự</span><button type="submit" disabled={submitting}>{submitting ? 'Đang gửi…' : 'Gửi đánh giá'}</button></div>
        </form>
      )}
      {!authLoading && !isAuthenticated && <p className="product-review-login">Vui lòng <Link to="/login">đăng nhập</Link> để gửi đánh giá.</p>}
      {myReview && <p className="product-review-login">Bạn đã gửi đánh giá {myReview.rating}/5 sao cho sản phẩm này.</p>}
      {error && <p className="product-review-error" role="alert">{error}</p>}
      {success && <p className="product-review-success" role="status">{success}</p>}

      {loading ? <div className="product-review-empty">Đang tải đánh giá…</div> : reviews.length === 0 ? (
        <div className="product-review-empty"><MessageSquareText size={24} /><span>Sản phẩm chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ!</span></div>
      ) : (
        <div className="product-review-list">
          {reviews.map((review) => <article className="product-review-item" key={review._id}>
            <div className="product-review-avatar">{(review.user?.name || 'K').slice(0, 1).toUpperCase()}</div>
            <div className="product-review-content"><div className="product-review-author"><strong>{review.user?.name || 'Khách hàng'}</strong><Stars value={review.rating} size={15} /><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</time></div><p>{review.comment || 'Khách hàng đã đánh giá sản phẩm này.'}</p></div>
          </article>)}
          <Pagination currentPage={page} totalItems={pagination.totalItems} pageSize={pagination.limit} onPageChange={setPage} itemLabel="đánh giá" />
        </div>
      )}
    </section>
  );
}
