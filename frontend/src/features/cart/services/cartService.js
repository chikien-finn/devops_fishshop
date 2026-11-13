import api from '../../../services/api.js';

const toCartItems = (cart) => (cart?.items || [])
  .filter((entry) => entry.product && typeof entry.product === 'object')
  .map(({ product, quantity }) => ({
    ...product,
    _id: product._id,
    quantity,
  }));

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return toCartItems(response.data?.data);
  },

  async syncCart(items) {
    const validId = /^[a-f\d]{24}$/i;
    const syncableItems = items.filter((item) => validId.test(String(item._id || '')));
    const localOnlyItems = items.filter((item) => !validId.test(String(item._id || '')));
    const response = await api.put('/cart/sync', {
      items: syncableItems.map(({ _id, quantity }) => ({ productId: _id, quantity })),
    });
    const serverItems = toCartItems(response.data?.data);
    const merged = new Map(serverItems.map((item) => [String(item._id), item]));
    localOnlyItems.forEach((item) => merged.set(String(item._id || item.id), item));
    return [...merged.values()];
  },
};

export default cartService;
