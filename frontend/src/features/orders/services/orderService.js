import api from '../../../services/api.js';

export const orderService = {
  async getPaymentConfig() {
    const response = await api.get('/orders/payment-config');
    return response.data?.data || {};
  },

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data?.data;
  },

  async validateCoupon(code, subtotal) {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data?.data || {};
  },

  async getMyOrders(params = {}) {
    const response = await api.get('/orders/my-orders', { params });
    const payload = response.data?.data;
    if (Array.isArray(payload)) {
      return {
        items: payload,
        pagination: { page: 1, limit: payload.length || 10, totalItems: payload.length, totalPages: 1 },
      };
    }
    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: {
        page: payload?.pagination?.page || 1,
        limit: payload?.pagination?.limit || 10,
        totalItems: payload?.pagination?.totalItems || 0,
        totalPages: payload?.pagination?.totalPages || 1,
      },
    };
  },

  async cancelMyOrder(id) {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data?.data;
  },

  async getAllOrders(params = {}) {
    const response = await api.get('/orders/admin', { params });
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
      };
    }

    return {
      items: Array.isArray(payload?.items) ? payload.items : [],
      pagination: {
        page: payload?.pagination?.page || 1,
        limit: payload?.pagination?.limit || 10,
        totalItems: payload?.pagination?.totalItems || 0,
        totalPages: payload?.pagination?.totalPages || 1,
      },
    };
  },

  async updateOrderStatus(id, status) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data?.data;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
    return response.data?.data;
  },

  async getOrderStats(options = {}) {
    const response = await api.get('/orders/stats', { signal: options.signal });
    return response.data?.data || {};
  },
};

export default orderService;

