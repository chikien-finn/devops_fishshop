import { sendSuccess } from '../../utils/responseHandler.js';
import * as reviewService from './review.service.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId, req.query);
    sendSuccess(res, reviews, 'Lấy danh sách đánh giá thành công');
  } catch (error) {
    next(error);
  }
};

export const getMyProductReview = async (req, res, next) => {
  try {
    const review = await reviewService.getUserReview(req.user.id, req.params.productId);
    sendSuccess(res, review, 'Lấy đánh giá của bạn thành công');
  } catch (error) {
    next(error);
  }
};

export const checkReviewEligibility = async (req, res, next) => {
  try {
    const status = await reviewService.checkReviewEligibility(req.user.id, req.params.productId);
    sendSuccess(res, status, 'Kiểm tra quyền đánh giá thành công');
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

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const data = await reviewService.getAllReviewsAdmin(req.query);
    sendSuccess(res, data, 'Lấy danh sách quản lý đánh giá thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const review = await reviewService.deleteReviewAdmin(req.params.id);
    sendSuccess(res, review, 'Xóa đánh giá thành công');
  } catch (error) {
    next(error);
  }
};
