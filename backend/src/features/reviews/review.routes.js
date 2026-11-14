import { Router } from 'express';
import {
  getProductReviews,
  getMyProductReview,
  checkReviewEligibility,
  createReview,
  getAllReviewsAdmin,
  deleteReviewAdmin,
} from './review.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Admin Routes (Yêu cầu đăng nhập & quyền Admin)
router.get('/admin', verifyToken, verifyAdmin, getAllReviewsAdmin);
router.delete('/:id', verifyToken, verifyAdmin, deleteReviewAdmin);

// Protected (Yêu cầu đăng nhập người dùng)
router.get('/product/:productId/mine', verifyToken, getMyProductReview);
router.get('/product/:productId/eligibility', verifyToken, checkReviewEligibility);
router.post('/product/:productId', verifyToken, createReview);

export default router;
