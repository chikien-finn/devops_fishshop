import { Router } from 'express';
import { createCoupon, listCoupons, updateCoupon, validateCoupon } from './coupon.controller.js';
import { verifyAdmin, verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();
router.post('/validate', verifyToken, validateCoupon);
router.get('/', verifyToken, verifyAdmin, listCoupons);
router.post('/', verifyToken, verifyAdmin, createCoupon);
router.patch('/:id', verifyToken, verifyAdmin, updateCoupon);
export default router;
