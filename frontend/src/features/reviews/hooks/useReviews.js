import { useState, useEffect, useCallback } from 'react';
import reviewApi from '../services/reviewApi.js';
import { useAuth } from '../../auth/hooks/useAuth.jsx';

const DEFAULT_PAGE_SIZE = 10;

export const useReviews = (productId) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const validProductId = /^[a-f\d]{24}$/i.test(String(productId || ''));

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ count: 0, average: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasPurchased: false,
    hasReviewed: false,
    reason: '',
    myReview: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tải danh sách đánh giá
  const fetchReviews = useCallback(async () => {
    if (!validProductId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await reviewApi.getProductReviews(productId, {
        page,
        limit: DEFAULT_PAGE_SIZE,
      });
      setReviews(data.items);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  }, [page, productId, validProductId]);

  // Kiểm tra điều kiện đánh giá của user
  const checkEligibility = useCallback(async () => {
    if (!validProductId || authLoading || !isAuthenticated) {
      setEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'Vui lòng đăng nhập để đánh giá',
        myReview: null,
      });
      return;
    }

    try {
      const result = await reviewApi.checkEligibility(productId);
      setEligibility(result);
    } catch {
      // Fallback kiểm tra myReview
      try {
        const myRev = await reviewApi.getMyReview(productId);
        setEligibility({
          canReview: !myRev,
          hasPurchased: true,
          hasReviewed: Boolean(myRev),
          reason: myRev ? 'Bạn đã đánh giá sản phẩm này rồi' : '',
          myReview: myRev,
        });
      } catch {
        setEligibility({
          canReview: false,
          hasPurchased: false,
          hasReviewed: false,
          reason: '',
          myReview: null,
        });
      }
    }
  }, [authLoading, isAuthenticated, productId, validProductId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  // Gửi đánh giá mới
  const submitReview = async ({ rating, comment }) => {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const created = await reviewApi.createReview(productId, {
        rating,
        comment: comment?.trim() || '',
      });
      setSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!');
      setEligibility((prev) => ({
        ...prev,
        canReview: false,
        hasReviewed: true,
        myReview: created,
      }));
      // Tải lại trang 1
      if (page === 1) {
        await fetchReviews();
      } else {
        setPage(1);
      }
      return { success: true, data: created };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviews,
    summary,
    pagination,
    page,
    setPage,
    eligibility,
    loading,
    submitting,
    error,
    success,
    fetchReviews,
    checkEligibility,
    submitReview,
  };
};

export default useReviews;
