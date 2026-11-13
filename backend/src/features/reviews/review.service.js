import mongoose from 'mongoose';
import Review from './review.model.js';
import { ApiError } from '../../utils/apiError.js';

export const getReviewsByProduct = async (productId, filters = {}) => {
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 20));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;

  const query = { product: productId };
  const [items, totalItems, summaryRows] = await Promise.all([
    Review.find(query).populate('user', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(query),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$rating' } } },
    ]),
  ]);
  const result = {
    items,
    pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
    summary: { count: summaryRows[0]?.count || 0, average: summaryRows[0]?.average || 0 },
  };
  if (filters.page === undefined && filters.limit === undefined) return items;
  return result;
};

export const getUserReview = async (userId, productId) => Review.findOne({ user: userId, product: productId }).lean();

export const addReview = async (userId, productId, reviewData) => {
  const rating = Number(reviewData.rating);
  const comment = String(reviewData.comment || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, 'Số sao đánh giá phải từ 1 đến 5');
  if (comment.length > 1000) throw new ApiError(400, 'Nội dung đánh giá tối đa 1000 ký tự');
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

