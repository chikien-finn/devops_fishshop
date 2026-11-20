import api from '../../../services/api.js';

export const couponService = {
  async listCoupons() {
    const res = await api.get('/coupons');
    return res.data?.data || [];
  },

  async createCoupon(couponData) {
    const res = await api.post('/coupons', couponData);
    return res.data?.data;
  },

  async updateCoupon(id, couponData) {
    const res = await api.patch(`/coupons/${id}`, couponData);
    return res.data?.data;
  },

  async deleteCoupon(id) {
    const res = await api.delete(`/coupons/${id}`);
    return res.data?.data;
  },
};

export default couponService;
