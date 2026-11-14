import { Router } from 'express';
import { getStats, getRecentOrders, getTopProducts } from './dashboard.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Tất cả endpoints Dashboard đều yêu cầu đăng nhập và quyền Admin
router.use(verifyToken, verifyAdmin);

router.get('/stats', getStats);
router.get('/recent-orders', getRecentOrders);
router.get('/top-products', getTopProducts);

export default router;
