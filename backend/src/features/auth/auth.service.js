import jwt from 'jsonwebtoken';
import { ENV } from '../../configs/env.config.js';
import { ApiError } from '../../utils/apiError.js';
import User from '../users/user.model.js';

export const register = async (userData) => {
  const { email, password, name, phone = '', address = '' } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email đã tồn tại trong hệ thống');
  }

  const user = await User.create({ email, password, name, phone, address });
  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

  return { user, token };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }
  return user;
};

