import { Router } from 'express';
import { getProductReviews, createReview } from './review.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// Protected
router.post('/product/:productId', verifyToken, createReview);

export default router;

