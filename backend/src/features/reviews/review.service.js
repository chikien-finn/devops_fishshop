import mongoose from 'mongoose';
import Review from './review.model.js';
import Order from '../orders/order.model.js';
import { ApiError } from '../../utils/apiError.js';

export const getReviewsByProduct = async (productId, filters = {}) => {
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 10));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;

  const productObjId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;
  const query = { product: productObjId };

  const ratingNum = parseInt(filters.rating, 10);
  if (ratingNum >= 1 && ratingNum <= 5) {
    query.rating = ratingNum;
  }

  const [totalItems, statsRows] = await Promise.all([
    Review.countDocuments(query),
    Review.aggregate([
      { $match: { product: productObjId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let overallTotal = 0;
  let overallSum = 0;

  statsRows.forEach((row) => {
    const star = Math.min(5, Math.max(1, Math.round(row._id)));
    breakdown[star] = (breakdown[star] || 0) + row.count;
    overallTotal += row.count;
    overallSum += star * row.count;
  });

  const overallAverage = overallTotal > 0 ? Number((overallSum / overallTotal).toFixed(1)) : 5.0;

  const useInvertedSort = skip > totalItems / 2 && totalItems > limit;
  let items;
  if (useInvertedSort) {
    const invertedSkip = Math.max(0, totalItems - skip - limit);
    const invertedLimit = Math.min(limit, totalItems - skip);
    items = await Review.find(query)
      .select('user product rating comment createdAt')
      .populate('user', 'name')
      .sort({ createdAt: 1, _id: 1 })
      .skip(invertedSkip)
      .limit(invertedLimit)
      .lean();
    items = items.reverse();
  } else {
    items = await Review.find(query)
      .select('user product rating comment createdAt')
      .populate('user', 'name')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const result = {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
    summary: {
      count: overallTotal,
      average: overallAverage,
      breakdown,
    },
  };
  if (filters.page === undefined && filters.limit === undefined && !filters.rating) return items;
  return result;
};

export const getUserReview = async (userId, productId) => Review.findOne({ user: userId, product: productId }).lean();

export const checkReviewEligibility = async (userId, productId) => {
  const [existingReview, hasPurchasedOrder] = await Promise.all([
    Review.findOne({ user: userId, product: productId }).lean(),
    Order.exists({
      user: userId,
      'items.product': productId,
      status: { $in: ['delivered', 'confirmed', 'shipping', 'pending'] },
    }),
  ]);

  const hasPurchased = Boolean(hasPurchasedOrder);
  const hasReviewed = Boolean(existingReview);
  const canReview = hasPurchased && !hasReviewed;

  let reason = '';
  if (!hasPurchased) {
    reason = 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng thành công';
  } else if (hasReviewed) {
    reason = 'Bạn đã đánh giá sản phẩm này rồi';
  }

  return {
    canReview,
    hasPurchased,
    hasReviewed,
    reason,
    myReview: existingReview,
  };
};

export const addReview = async (userId, productId, reviewData) => {
  const rating = Number(reviewData.rating);
  const comment = String(reviewData.comment || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, 'Số sao đánh giá phải từ 1 đến 5');
  if (comment.length > 1000) throw new ApiError(400, 'Nội dung đánh giá tối đa 1000 ký tự');

  // Điều kiện tiên quyết: Phải từng mua sản phẩm mới được đánh giá
  const hasPurchased = await Order.exists({
    user: userId,
    'items.product': productId,
    status: { $in: ['delivered', 'confirmed', 'shipping', 'pending'] },
  });
  if (!hasPurchased) {
    throw new ApiError(403, 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng thành công');
  }

  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) {
    throw new ApiError(400, 'Bạn đã đánh giá sản phẩm này rồi');
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment,
  });

  return await review.populate('user', 'name');
};

let reviewAdminStatsCache = null;
const REVIEW_STATS_CACHE_MS = 300_000; // 5 phút

export const invalidateReviewAdminCache = () => {
  reviewAdminStatsCache = null;
};

/**
 * Quản lý toàn bộ đánh giá dành cho Admin (Hỗ trợ lọc số sao, tìm kiếm, phân trang)
 * Tối ưu hóa không aggregate 140k dòng trong mỗi request phân trang
 */
export const getAllReviewsAdmin = async (filters = {}) => {
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 10));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.rating) {
    const star = parseInt(filters.rating, 10);
    if (star >= 1 && star <= 5) {
      query.rating = star;
    }
  }

  if (filters.search) {
    const regex = new RegExp(filters.search.trim(), 'i');
    query.comment = regex;
  }

  // Nếu query rỗng, count dùng estimatedDocumentCount (<1ms)
  const isDefaultQuery = Object.keys(query).length === 0;
  const countPromise = isDefaultQuery
    ? Review.estimatedDocumentCount().catch(() => 0)
    : Review.countDocuments(query).catch(() => 0);

  // Stats được cache hoặc tính nhanh từ sample
  const getStatsFast = async () => {
    if (reviewAdminStatsCache && Date.now() - reviewAdminStatsCache.timestamp < REVIEW_STATS_CACHE_MS) {
      return reviewAdminStatsCache.data;
    }

    const [total, sample] = await Promise.all([
      Review.estimatedDocumentCount().catch(() => 0),
      Review.find().sort({ createdAt: -1 }).limit(50).select('rating').lean().catch(() => []),
    ]);

    let sum = 0;
    let fiveStar = 0;
    let lowStar = 0;
    for (const r of sample) {
      const star = Number(r.rating) || 5;
      sum += star;
      if (star === 5) fiveStar++;
      else if (star <= 2) lowStar++;
    }

    const sampleCount = Math.max(1, sample.length);
    const scale = total > sampleCount ? total / sampleCount : 1;

    const statsData = {
      total,
      avgRating: Number((sum / sampleCount).toFixed(1)) || 5.0,
      fiveStarCount: Math.round(fiveStar * scale),
      lowStarCount: Math.round(lowStar * scale),
    };

    reviewAdminStatsCache = { data: statsData, timestamp: Date.now() };
    return statsData;
  };

  const [totalItems, stats] = await Promise.all([
    countPromise,
    getStatsFast(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const count = Math.max(0, Math.min(limit, totalItems - skip));

  let items = [];
  if (count > 0) {
    if (skip > totalItems / 2) {
      const tailSkip = Math.max(0, totalItems - (skip + count));
      items = await Review.find(query)
        .select('user product rating comment createdAt')
        .populate('user', 'name email')
        .populate('product', 'name slug price images category categoryName')
        .sort({ createdAt: 1, _id: 1 })
        .skip(tailSkip)
        .limit(count)
        .lean();
      items.reverse();
    } else {
      items = await Review.find(query)
        .select('user product rating comment createdAt')
        .populate('user', 'name email')
        .populate('product', 'name slug price images category categoryName')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }
  }

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
    stats: {
      total: stats.total || 0,
      avgRating: stats.avgRating || 5.0,
      fiveStarCount: stats.fiveStarCount || 0,
      lowStarCount: stats.lowStarCount || 0,
    },
  };
};

/**
 * Xóa / Kiểm duyệt đánh giá không phù hợp (Chỉ Admin)
 */
export const deleteReviewAdmin = async (reviewId) => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new ApiError(404, 'Không tìm thấy đánh giá cần xóa');
  }
  return review;
};
