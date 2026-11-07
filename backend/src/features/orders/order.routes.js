import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
} from './order.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Admin routes
router.get('/admin', verifyAdmin, getAllOrders);
router.patch('/:id/status', verifyAdmin, updateStatus);

export default router;

