import { sendSuccess } from '../../utils/responseHandler.js';
import * as cartService from './cart.service.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCartByUserId(req.user.id);
    sendSuccess(res, cart, 'Lấy thông tin giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItemToCart(req.user.id, productId, quantity);
    sendSuccess(res, cart, 'Thêm sản phẩm vào giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeItemFromCart(req.user.id, req.params.productId);
    sendSuccess(res, cart, 'Đã xóa sản phẩm khỏi giỏ hàng');
  } catch (error) {
    next(error);
  }
};

