import api from '../../../services/api.js';

export const reviewService = {
  async getProductReviews(productId, params = {}) {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return { items: payload, pagination: { page: 1, limit: payload.length || 10, totalItems: payload.length, totalPages: 1 }, summary: { count: payload.length, average: 0 } };
    }
    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: payload?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
      summary: payload?.summary || { count: 0, average: 0 },
    };
  },

  async getMyReview(productId) {
    const response = await api.get(`/reviews/product/${productId}/mine`);
    return response.data?.data || null;
  },

  async createReview(productId, review) {
    const response = await api.post(`/reviews/product/${productId}`, review);
    return response.data?.data;
  },
};

export default reviewService;
