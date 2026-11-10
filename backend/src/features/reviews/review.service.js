import Review from './review.model.js';
import { ApiError } from '../../utils/apiError.js';

export const getReviewsByProduct = async (productId, filters = {}) => {
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 20));
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const skip = (page - 1) * limit;

  return await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export const addReview = async (userId, productId, reviewData) => {
  const { rating, comment } = reviewData;
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

