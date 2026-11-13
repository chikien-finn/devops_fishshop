import Cart from './cart.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/apiError.js';
import mongoose from 'mongoose';

export const getCartByUserId = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Sản phẩm không tồn tại');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return await cart.populate('items.product');
};

export const removeItemFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Không tìm thấy giỏ hàng');

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return await cart.populate('items.product');
};

export const syncCartItems = async (userId, items = []) => {
  if (!Array.isArray(items)) throw new ApiError(400, 'Danh sách sản phẩm trong giỏ không hợp lệ');

  const normalized = new Map();
  for (const item of items) {
    const productId = item.productId || item.product || item._id;
    const quantity = Number(item.quantity);
    if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new ApiError(400, 'Sản phẩm hoặc số lượng trong giỏ không hợp lệ');
    }
    const totalQuantity = (normalized.get(String(productId)) || 0) + quantity;
    if (totalQuantity > 99) throw new ApiError(400, 'Mỗi sản phẩm được thêm tối đa 99 cái');
    normalized.set(String(productId), totalQuantity);
  }

  const productIds = [...normalized.keys()];
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds }, isActive: true }).select('_id').lean()
    : [];
  if (products.length !== productIds.length) throw new ApiError(404, 'Có sản phẩm trong giỏ không còn kinh doanh');

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: products.map((product) => ({ product: product._id, quantity: normalized.get(String(product._id)) })) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return await cart.populate('items.product');
};

