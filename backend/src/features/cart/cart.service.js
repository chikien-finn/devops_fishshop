import Cart from './cart.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/apiError.js';

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

