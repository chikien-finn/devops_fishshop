import api from '../../../services/api.js';

const CACHE_TTL_MS = 60_000; // Cache 60 giây ở frontend cho dashboard mượt tức thì
const cache = new Map();

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, time: Date.now() });
};

export const clearDashboardCache = () => {
  cache.clear();
};

export const dashboardApi = {
  /**
   * Lấy số liệu thống kê tổng hợp (Doanh thu, Đơn hàng, Sản phẩm cá cảnh, Khách hàng)
   */
  async getStats(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCached('stats');
      if (cached) return cached;
    }
    const response = await api.get('/admin/dashboard/stats');
    const data = response.data?.data;
    if (data) setCached('stats', data);
    return data;
  },

  /**
   * Lấy 5 đơn hàng mới nhất cần xử lý
   */
  async getRecentOrders(limit = 5, forceRefresh = false) {
    const key = `recentOrders:${limit}`;
    if (!forceRefresh) {
      const cached = getCached(key);
      if (cached) return cached;
    }
    const response = await api.get('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    const data = response.data?.data || [];
    setCached(key, data);
    return data;
  },

  /**
   * Lấy danh sách Top 5 sản phẩm / cá cảnh bán chạy nhất
   */
  async getTopProducts(limit = 5, forceRefresh = false) {
    const key = `topProducts:${limit}`;
    if (!forceRefresh) {
      const cached = getCached(key);
      if (cached) return cached;
    }
    const response = await api.get('/admin/dashboard/top-products', {
      params: { limit },
    });
    const data = response.data?.data || [];
    setCached(key, data);
    return data;
  },
};

export default dashboardApi;
