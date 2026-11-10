import { Router } from 'express';
import {
  getProducts,
  getHomeProducts,
  getProductStats,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from './product.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes (static paths must come before /:id)
router.get('/', getProducts);
router.get('/home', getHomeProducts);
router.get('/stats', verifyToken, verifyAdmin, getProductStats);
router.get('/:id', getProduct);

// Admin-protected routes
router.post('/', verifyToken, verifyAdmin, createProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, deleteProduct);

export default router;

