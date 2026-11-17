import { Router } from 'express';
import {
  getUsers,
  getProfile,
  getUser,
  updateProfile,
  updateUserRole,
  deleteUser,
} from './user.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Profile endpoints for logged-in user
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Specific user endpoint (self or admin)
router.get('/:id', verifyToken, getUser);

// Admin-only endpoints
router.get('/', verifyToken, verifyAdmin, getUsers);
router.patch('/:id/role', verifyToken, verifyAdmin, updateUserRole);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
