import { Router } from 'express';
import { getProductReviews, getMyProductReview, checkReviewEligibility, createReview } from './review.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Protected (Yêu cầu đăng nhập)
router.get('/product/:productId/mine', verifyToken, getMyProductReview);
router.get('/product/:productId/eligibility', verifyToken, checkReviewEligibility);
router.post('/product/:productId', verifyToken, createReview);

export default router;
