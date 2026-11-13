import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  cancelMyOrder,
  getAllOrders,
  getOrderStats,
  updateStatus,
  getPaymentConfig,
  updatePaymentStatus,
} from './order.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/payment-config', getPaymentConfig);
router.use(verifyToken);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.patch('/:id/cancel', cancelMyOrder);

// Admin routes
router.get('/stats', verifyAdmin, getOrderStats);
router.get('/admin', verifyAdmin, getAllOrders);
router.patch('/:id/status', verifyAdmin, updateStatus);
router.patch('/:id/payment-status', verifyAdmin, updatePaymentStatus);

export default router;

