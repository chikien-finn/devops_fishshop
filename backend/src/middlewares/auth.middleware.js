import jwt from 'jsonwebtoken';
import { ENV } from '../configs/env.config.js';
import { ApiError } from '../utils/apiError.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Unauthorized: No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Unauthorized: Invalid or expired token'));
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: Admin access required'));
  }
  next();
};

