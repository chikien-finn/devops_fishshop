import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from './cart.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/:productId', removeFromCart);

export default router;

