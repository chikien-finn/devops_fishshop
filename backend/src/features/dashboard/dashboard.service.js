import mongoose from 'mongoose';
import Order from '../orders/order.model.js';
import Product from '../products/product.model.js';
import User from '../users/user.model.js';
import Review from '../reviews/review.model.js';

const STATS_CACHE_TTL_MS = 30_000;
let dashboardStatsCache = null;

export const invalidateDashboardCache = () => {
  dashboardStatsCache = null;
};

/**
 * Thống kê tổng hợp: Doanh thu, Đơn hàng, Sản phẩm/Cá cảnh, Khách hàng
 */
export const getDashboardStats = async () => {
  if (dashboardStatsCache && Date.now() - dashboardStatsCache.timestamp < STATS_CACHE_TTL_MS) {
    return dashboardStatsCache.data;
  }

  const [orderSummaryRows, productStats, userStats, reviewStats] = await Promise.all([
    // 1. Thống kê đơn hàng & doanh thu
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $ne: ['$status', 'cancelled'] }, '$totalAmount', 0],
            },
          },
          deliveredRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0],
            },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          shippingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipping'] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
    ]),

    // 2. Thống kê sản phẩm & kho hàng
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          fishCount: {
            $sum: { $cond: [{ $eq: ['$category', 'fish'] }, 1, 0] },
          },
          plantCount: {
            $sum: { $cond: [{ $eq: ['$category', 'plant'] }, 1, 0] },
          },
          foodCount: {
            $sum: { $cond: [{ $eq: ['$category', 'food'] }, 1, 0] },
          },
          accessoryCount: {
            $sum: { $cond: [{ $eq: ['$category', 'accessory'] }, 1, 0] },
          },
          freshwaterCount: {
            $sum: { $cond: [{ $eq: ['$waterType', 'freshwater'] }, 1, 0] },
          },
          saltwaterCount: {
            $sum: { $cond: [{ $eq: ['$waterType', 'saltwater'] }, 1, 0] },
          },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] },
          },
        },
      },
    ]),

    // 3. Thống kê người dùng
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          customerCount: {
            $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] },
          },
          adminCount: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
          },
        },
      },
    ]),

    // 4. Thống kê đánh giá
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]),
  ]);

  const ord = orderSummaryRows[0] || {};
  const prd = productStats[0] || {};
  const usr = userStats[0] || {};
  const rev = reviewStats[0] || {};

  const summary = {
    // 4 KPI Cards Chính
    revenue: {
      totalRevenue: ord.totalRevenue || 0,
      deliveredRevenue: ord.deliveredRevenue || 0,
      averageOrderValue: ord.totalOrders > 0 ? Math.round((ord.totalRevenue || 0) / ord.totalOrders) : 0,
    },
    orders: {
      total: ord.totalOrders || 0,
      pending: ord.pendingOrders || 0,
      confirmed: ord.confirmedOrders || 0,
      shipping: ord.shippingOrders || 0,
      delivered: ord.deliveredOrders || 0,
      cancelled: ord.cancelledOrders || 0,
      successRate:
        ord.totalOrders > 0
          ? Math.round(((ord.deliveredOrders || 0) / ord.totalOrders) * 100)
          : 0,
    },
    products: {
      total: prd.totalProducts || 0,
      totalStock: prd.totalStock || 0,
      totalInventoryValue: prd.totalInventoryValue || 0,
      fishCount: prd.fishCount || 0,
      plantCount: prd.plantCount || 0,
      foodCount: prd.foodCount || 0,
      accessoryCount: prd.accessoryCount || 0,
      freshwaterCount: prd.freshwaterCount || 0,
      saltwaterCount: prd.saltwaterCount || 0,
      lowStockCount: prd.lowStockCount || 0,
    },
    customers: {
      total: usr.totalUsers || 0,
      customers: usr.customerCount || 0,
      admins: usr.adminCount || 0,
    },
    reviews: {
      total: rev.totalReviews || 0,
      avgRating: rev.avgRating ? Number(rev.avgRating.toFixed(1)) : 5.0,
    },
  };

  dashboardStatsCache = {
    data: summary,
    timestamp: Date.now(),
  };

  return summary;
};

/**
 * Lấy 5 đơn hàng mới nhất cần xử lý
 */
export const getRecentOrders = async (limit = 5) => {
  const parsedLimit = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate('user', 'name email phoneNumber')
    .lean();

  return orders.map((o) => ({
    _id: o._id,
    orderCode: `ORD-${String(o._id).slice(-6).toUpperCase()}`,
    customerName: o.user?.name || 'Khách vãng lai',
    customerEmail: o.user?.email || '',
    phoneNumber: o.phoneNumber,
    shippingAddress: o.shippingAddress,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status,
    itemCount: (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
    items: o.items || [],
    createdAt: o.createdAt,
  }));
};

/**
 * Top 5 sản phẩm / cá cảnh bán chạy nhất
 */
export const getTopSellingProducts = async (limit = 5) => {
  const parsedLimit = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));

  const topAgg = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        soldQuantity: { $sum: '$items.quantity' },
        totalRevenue: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    { $sort: { soldQuantity: -1, totalRevenue: -1 } },
    { $limit: parsedLimit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        soldQuantity: 1,
        totalRevenue: 1,
        name: { $ifNull: ['$productInfo.name', 'Sản phẩm đã gỡ'] },
        slug: '$productInfo.slug',
        price: { $ifNull: ['$productInfo.price', 0] },
        stock: { $ifNull: ['$productInfo.stock', 0] },
        category: '$productInfo.category',
        subCategory: '$productInfo.subCategory',
        categoryName: '$productInfo.categoryName',
        images: '$productInfo.images',
        waterType: '$productInfo.waterType',
      },
    },
  ]);

  if (topAgg.length > 0) {
    return topAgg;
  }

  // Fallback: Nếu hệ thống chưa có đơn hàng nào, lấy 5 sản phẩm nổi bật có sẵn trong kho
  const fallback = await Product.find({ isActive: true })
    .sort({ price: -1, stock: -1 })
    .limit(parsedLimit)
    .lean();

  return fallback.map((p, idx) => ({
    _id: p._id,
    soldQuantity: Math.max(0, 15 - idx * 2), // Demo sample number
    totalRevenue: (Math.max(0, 15 - idx * 2)) * p.price,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    category: p.category,
    subCategory: p.subCategory,
    categoryName: p.categoryName,
    images: p.images,
    waterType: p.waterType,
  }));
};
