import api from '../../../services/api.js';

const CACHE_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 60;
const responseCache = new Map();

const normalizeParams = (params = {}) => {
  const clean = {};
  for (const key of Object.keys(params).sort()) {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      clean[key] = val;
    }
  }
  return clean;
};

const getCached = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
};

export const clearProductCache = () => {
  responseCache.clear();
};

export const isRequestCanceled = (err) =>
  err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';

export const productService = {
  async getProducts(params = {}, options = {}) {
    const cleanParams = normalizeParams(params);
    const useCache = options.useCache !== false;
    const cacheKey = `list:${JSON.stringify(cleanParams)}`;

    if (useCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get('/products', {
      params: cleanParams,
      signal: options.signal,
    });
    const payload = response.data?.data;

    const result = Array.isArray(payload)
      ? {
          items: payload,
          pagination: {
            page: 1,
            limit: payload.length || 20,
            totalItems: payload.length,
            totalPages: 1,
          },
        }
      : {
          items: Array.isArray(payload?.items) ? payload.items : [],
          pagination: {
            page: payload?.pagination?.page || 1,
            limit: payload?.pagination?.limit || 20,
            totalItems: payload?.pagination?.totalItems || 0,
            totalPages: payload?.pagination?.totalPages || 1,
          },
        };

    if (useCache) {
      setCached(cacheKey, result);
    }
    return result;
  },

  async getHomeProducts(options = {}) {
    const useCache = options.useCache !== false;
    const cacheKey = 'home:sections';
    if (useCache) {
      const cached = getCached(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get('/products/home', { signal: options.signal });
    const data = response.data?.data || {};
    if (useCache) {
      setCached(cacheKey, data);
    }
    return data;
  },

  async getProductStats(options = {}) {
    const response = await api.get('/products/stats', { signal: options.signal });
    return response.data?.data || {};
  },

  async getProductById(id, options = {}) {
    const response = await api.get(`/products/${id}`, { signal: options.signal });
    return response.data?.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    clearProductCache();
    return response.data?.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    clearProductCache();
    return response.data?.data;
  },

  async deleteProduct(id, hard = false) {
    const response = await api.delete(`/products/${id}`, {
      params: { hard: hard ? 'true' : 'false' },
    });
    clearProductCache();
    return response.data?.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data;
  },
};

export default productService;
