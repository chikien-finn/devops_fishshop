import mongoose from 'mongoose';
import Order from './order.model.js';
import Cart from '../cart/cart.model.js';
import Product from '../products/product.model.js';
import Coupon from '../coupons/coupon.model.js';
import { getValidCoupon } from '../coupons/coupon.service.js';
import { ApiError } from '../../utils/apiError.js';

export const SHIPPING_FEES = { north: 35000, central: 25000, south: 30000 };

const ORDER_STATS_TTL_MS = 60_000;
let orderStatsCache = null;
let orderStatsInFlight = null;

const invalidateOrderStatsCache = () => {
  orderStatsCache = null;
};

export const createOrder = async (userId, orderData) => {
  const { shippingAddress, phoneNumber, paymentMethod, items: bodyItems } = orderData;
  const shippingRegion = ['north', 'central', 'south'].includes(orderData.shippingRegion) ? orderData.shippingRegion : 'central';

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
  const productsToDeduct = [];

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

    productsToDeduct.push({ product, quantity: qty });

    verifiedItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
  }

  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = SHIPPING_FEES[shippingRegion];
  let couponCode = '';
  let discountAmount = 0;
  if (orderData.couponCode) {
    const { coupon, discountAmount: calculatedDiscount } = await getValidCoupon(orderData.couponCode, subtotal);
    discountAmount = calculatedDiscount;
    couponCode = coupon.code;
    const usageFilter = { _id: coupon._id, active: true };
    if (coupon.usageLimit != null) usageFilter.usedCount = { $lt: coupon.usageLimit };
    const claimed = await Coupon.findOneAndUpdate(usageFilter, { $inc: { usedCount: 1 } }, { new: true });
    if (!claimed) throw new ApiError(409, 'Mã giảm giá vừa hết lượt sử dụng, vui lòng thử mã khác');
  }
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  // Validate the voucher before changing inventory, so an invalid code cannot reduce stock.
  for (const { product, quantity } of productsToDeduct) {
    product.stock = Math.max(0, product.stock - quantity);
    product.soldOut = product.stock <= 0;
    await product.save();
  }

  const order = await Order.create({
    user: userId,
    items: verifiedItems,
    totalAmount,
    subtotal,
    shippingFee,
    discountAmount,
    couponCode,
    shippingRegion,
    shippingAddress,
    phoneNumber,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentMethod === 'banking' ? 'pending' : 'unpaid',
    paymentExpiresAt: paymentMethod === 'banking' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
    statusUpdatedAt: new Date(),
  });

  // Clear backend cart if it exists
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  invalidateOrderStatsCache();
  return order;
};

export const getUserOrders = async (userId, filters = {}) => {
  await expireOverdueBankTransfers();
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;
  const query = { user: userId };
  if (filters.status && filters.status !== 'all') query.status = filters.status;
  const [items, totalItems] = await Promise.all([
    Order.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // Retain the original array response for clients that call this endpoint without query params.
  if (filters.page === undefined && filters.limit === undefined && filters.status === undefined) return items;
  return { items, pagination: { page, limit, totalItems, totalPages } };
};

export const getAllOrders = async (filters = {}) => {
  await expireOverdueBankTransfers();
  const query = {};
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const countQuery = Object.keys(query).length === 0
    ? Order.estimatedDocumentCount()
    : Order.countDocuments(query);

  const [items, totalItems] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    countQuery,
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
  const allowedStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) throw new ApiError(400, 'Trạng thái đơn hàng không hợp lệ');
  if (status === 'cancelled') return cancelOrderAndRestock(orderId);

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: 'cancelled' } },
    { $set: { status, statusUpdatedAt: new Date() } },
    { returnDocument: 'after', runValidators: true }
  );
  if (!order) {
    const existing = await Order.findById(orderId);
    if (!existing) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    throw new ApiError(409, 'Đơn hàng đã hủy, không thể chuyển trạng thái');
  }
  invalidateOrderStatsCache();
  return order;
};

const cancelOrderAndRestock = async (orderId, userId = null) => {
  const query = { _id: orderId, status: { $ne: 'cancelled' } };
  if (userId) query.user = userId;
  const order = await Order.findOneAndUpdate(
    query,
    { $set: { status: 'cancelled', statusUpdatedAt: new Date() } },
    { returnDocument: 'after', runValidators: true }
  );

  if (!order) {
    const lookup = { _id: orderId };
    if (userId) lookup.user = userId;
    const existing = await Order.findOne(lookup).select('status').lean();
    if (!existing) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (existing.status === 'cancelled') throw new ApiError(409, 'Đơn hàng đã được hủy trước đó');
    if (userId && existing.status !== 'pending') throw new ApiError(409, 'Chỉ có thể hủy đơn hàng đang chờ xác nhận');
    throw new ApiError(409, 'Không thể hủy đơn hàng ở trạng thái hiện tại');
  }

  await Promise.all(order.items.map((item) => Product.findByIdAndUpdate(item.product, {
    $inc: { stock: item.quantity },
    $set: { soldOut: false },
  })));
  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
  }
  invalidateOrderStatsCache();
  return order;
};

export const cancelUserOrder = async (userId, orderId) => cancelOrderAndRestock(orderId, userId);

export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  const allowedStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'expired'];
  if (!allowedStatuses.includes(paymentStatus)) throw new ApiError(400, 'Trạng thái thanh toán không hợp lệ');
  const query = { _id: orderId };
  if (paymentStatus !== 'unpaid') query.paymentMethod = 'banking';
  const update = { paymentStatus };
  if (paymentStatus === 'paid') update.paymentPaidAt = new Date();
  const order = await Order.findOneAndUpdate(query, { $set: update }, { returnDocument: 'after', runValidators: true });
  if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
  return order;
};

export const expireOverdueBankTransfers = async () => {
  const now = new Date();
  const query = {
    paymentMethod: 'banking',
    paymentStatus: { $in: ['pending', 'failed'] },
    paymentExpiresAt: { $lte: now },
    status: { $in: ['pending', 'confirmed'] },
  };
  const overdueOrders = await Order.find(query).select('_id items couponCode').lean();
  let modifiedCount = 0;

  for (const overdueOrder of overdueOrders) {
    const expiredOrder = await Order.findOneAndUpdate(
      { ...query, _id: overdueOrder._id },
      { $set: { paymentStatus: 'expired', status: 'cancelled', statusUpdatedAt: now } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!expiredOrder) continue;

    await Promise.all(expiredOrder.items.map((item) => Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
      $set: { soldOut: false },
    })));
    if (expiredOrder.couponCode) {
      await Coupon.findOneAndUpdate({ code: expiredOrder.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } });
    }
    modifiedCount += 1;
  }

  if (modifiedCount > 0) invalidateOrderStatsCache();
  return { modifiedCount };
};
export const getOrderStats = async () => {
  if (orderStatsCache && Date.now() - orderStatsCache.timestamp < ORDER_STATS_TTL_MS) {
    return orderStatsCache.data;
  }
  if (orderStatsInFlight) {
    return await orderStatsInFlight;
  }

  orderStatsInFlight = (async () => {
    const rows = await Order.aggregate([
      { $match: { status: { $gte: '' } } },
      { $project: { _id: 0, status: 1, totalAmount: 1 } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
        },
      },
    ]);

    const summary = {
      totalOrders: 0,
      pendingCount: 0,
      confirmedCount: 0,
      shippingCount: 0,
      deliveredCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
      deliveredRevenue: 0,
    };

    for (const row of rows) {
      const status = row._id;
      const count = row.count || 0;
      const revenue = row.revenue || 0;

      summary.totalOrders += count;
      if (status !== 'cancelled') {
        summary.totalRevenue += revenue;
      }

      if (status === 'pending') summary.pendingCount += count;
      else if (status === 'confirmed') summary.confirmedCount += count;
      else if (status === 'shipping') summary.shippingCount += count;
      else if (status === 'delivered') {
        summary.deliveredCount += count;
        summary.deliveredRevenue += revenue;
      } else if (status === 'cancelled') {
        summary.cancelledCount += count;
      }
    }

    orderStatsCache = { data: summary, timestamp: Date.now() };
    return summary;
  })();

  try {
    return await orderStatsInFlight;
  } finally {
    orderStatsInFlight = null;
  }
};
