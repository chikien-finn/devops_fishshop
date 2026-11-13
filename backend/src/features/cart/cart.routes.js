import { Router } from 'express';
import { getCart, addToCart, removeFromCart, syncCart } from './cart.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getCart);
router.put('/sync', syncCart);
router.post('/add', addToCart);
router.delete('/:productId', removeFromCart);

export default router;

