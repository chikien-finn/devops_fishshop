import { sendSuccess } from '../../utils/responseHandler.js';
import * as reviewService from './review.service.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    sendSuccess(res, reviews, 'Lấy danh sách đánh giá thành công');
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.addReview(
      req.user.id,
      req.params.productId,
      req.body
    );
    sendSuccess(res, review, 'Đánh giá sản phẩm thành công', 201);
  } catch (error) {
    next(error);
  }
};

