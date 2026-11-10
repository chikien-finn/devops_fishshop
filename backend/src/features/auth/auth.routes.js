import { Router } from 'express';
import { register, login, getMe, changePassword, forgotPassword } from './auth.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

export default router;

