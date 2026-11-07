import Product from './product.model.js';
import { ApiError } from '../../utils/apiError.js';

export const getAllProducts = async (filters = {}) => {
  const query = {};
  if (filters.all !== 'true' && filters.isActive === undefined) {
    query.isActive = true;
  } else if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }
  if (filters.waterType && filters.waterType !== 'all') {
    query.waterType = filters.waterType;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  return await Product.find(query).sort({ createdAt: -1 });
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  return product;
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const updateProduct = async (id, updateData) => {
  const product = await Product.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  return product;
};

export const deleteProduct = async (id, hard = false) => {
  let product;
  if (hard) {
    product = await Product.findByIdAndDelete(id);
  } else {
    product = await Product.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
  }
  if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  return product;
};

