import api from '../../../services/api.js';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data?.data || [];
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data?.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data?.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data?.data;
  },

  async deleteProduct(id, hard = false) {
    const response = await api.delete(`/products/${id}`, {
      params: { hard: hard ? 'true' : 'false' },
    });
    return response.data?.data;
  },
};

export default productService;

