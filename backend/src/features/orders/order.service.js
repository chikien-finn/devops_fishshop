import mongoose from 'mongoose';
import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import Product from '../products/product.model.js';
import { ApiError } from '../../utils/apiError.js';

export const createOrder = async (userId, orderData) => {
  const { shippingAddress, phoneNumber, paymentMethod, items: bodyItems } = orderData;

  if (!shippingAddress || !phoneNumber) {
    throw new ApiError(400, 'Vui lòng cung cấp đầy đủ địa chỉ giao hàng và số điện thoại');
  }

  let rawItems = [];
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (Array.isArray(bodyItems) && bodyItems.length > 0) {
    rawItems = bodyItems;
  } else if (cart && cart.items.length > 0) {
    rawItems = cart.items.map((item) => ({
      product: item.product?._id,
      name: item.product?.name,
      price: item.product?.price,
      quantity: item.quantity,
    }));
  }

  if (rawItems.length === 0) {
    throw new ApiError(400, 'Giỏ hàng trống, không thể tạo đơn hàng');
  }

  const verifiedItems = [];

  for (const raw of rawItems) {
    const prodKey = raw.product || raw._id || raw.id;
    let product = null;

    if (prodKey && mongoose.Types.ObjectId.isValid(prodKey)) {
      product = await Product.findById(prodKey);
    }
    if (!product && raw.slug) {
      product = await Product.findOne({ slug: raw.slug });
    }
    if (!product && raw.name) {
      product = await Product.findOne({ name: raw.name });
    }

    if (!product) {
      throw new ApiError(404, `Không tìm thấy sản phẩm: ${raw.name || prodKey}`);
    }

    const qty = Math.max(1, Number(raw.quantity) || 1);
    if (product.stock < qty) {
      throw new ApiError(400, `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`);
    }

    // Deduct stock and update soldOut flag
    product.stock = Math.max(0, product.stock - qty);
    product.soldOut = product.stock <= 0;
    await product.save();

    verifiedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
  }

  const totalAmount = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: userId,
    items: verifiedItems,
    totalAmount,
    shippingAddress,
    phoneNumber,
    paymentMethod: paymentMethod || 'cod',
  });

  // Clear backend cart if it exists
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return order;
};

export const getUserOrders = async (userId, filters = {}) => {
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;

  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const getAllOrders = async (filters = {}) => {
  const query = {};
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { returnDocument: 'after' });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  return order;
};
