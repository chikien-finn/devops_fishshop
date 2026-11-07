import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import { ApiError } from '../../utils/apiError.js';

export const createOrder = async (userId, orderData) => {
  const { shippingAddress, phoneNumber, paymentMethod } = orderData;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Giỏ hàng trống, không thể tạo đơn hàng');
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    shippingAddress,
    phoneNumber,
    paymentMethod,
  });

  // Clear cart after order creation
  cart.items = [];
  await cart.save();

  return order;
};

export const getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
  return await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  return order;
};

