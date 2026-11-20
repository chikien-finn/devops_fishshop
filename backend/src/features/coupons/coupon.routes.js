import { Router } from 'express';
import { createCoupon, deleteCoupon, getActiveCoupons, listCoupons, updateCoupon, validateCoupon } from './coupon.controller.js';
import { verifyAdmin, verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);
router.get('/', verifyToken, verifyAdmin, listCoupons);
router.post('/', verifyToken, verifyAdmin, createCoupon);
router.patch('/:id', verifyToken, verifyAdmin, updateCoupon);
router.delete('/:id', verifyToken, verifyAdmin, deleteCoupon);
export default router;
