import api from '../../../services/api.js';

export const reviewApi = {
  /**
   * Lấy danh sách đánh giá của sản phẩm (hỗ trợ phân trang, lọc số sao)
   */
  async getProductReviews(productId, params = {}) {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return {
        items: payload,
        pagination: {
          page: 1,
          limit: payload.length || 10,
          totalItems: payload.length,
          totalPages: 1,
        },
        summary: { count: payload.length, average: 0 },
      };
    }
    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: payload?.pagination || {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      },
      summary: payload?.summary || { count: 0, average: 0 },
    };
  },

  /**
   * Lấy đánh giá của chính user hiện tại cho sản phẩm này (nếu có)
   */
  async getMyReview(productId) {
    const response = await api.get(`/reviews/product/${productId}/mine`);
    return response.data?.data || null;
  },

  /**
   * Kiểm tra điều kiện đánh giá (đã từng mua hàng chưa, đã đánh giá chưa)
   */
  async checkEligibility(productId) {
    const response = await api.get(`/reviews/product/${productId}/eligibility`);
    return response.data?.data || { canReview: false, hasPurchased: false, hasReviewed: false };
  },

  /**
   * Gửi đánh giá mới (chỉ hợp lệ nếu đã mua hàng thành công)
   */
  async createReview(productId, review) {
    const response = await api.post(`/reviews/product/${productId}`, review);
    return response.data?.data;
  },
};

export default reviewApi;
