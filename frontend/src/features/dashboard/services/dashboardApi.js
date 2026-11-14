import api from '../../../services/api.js';

export const dashboardApi = {
  /**
   * Lấy số liệu thống kê tổng hợp (Doanh thu, Đơn hàng, Sản phẩm cá cảnh, Khách hàng)
   */
  async getStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data?.data;
  },

  /**
   * Lấy 5 đơn hàng mới nhất cần xử lý
   */
  async getRecentOrders(limit = 5) {
    const response = await api.get('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    return response.data?.data || [];
  },

  /**
   * Lấy danh sách Top 5 sản phẩm / cá cảnh bán chạy nhất
   */
  async getTopProducts(limit = 5) {
    const response = await api.get('/admin/dashboard/top-products', {
      params: { limit },
    });
    return response.data?.data || [];
  },
};

export default dashboardApi;
