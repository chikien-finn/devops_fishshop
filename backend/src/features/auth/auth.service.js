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

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
  }
  if (String(newPassword).length < 6) {
    throw new ApiError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Mật khẩu hiện tại không chính xác');
  }

  user.password = newPassword;
  await user.save();
  return { updated: true };
};

export const resetPasswordSimple = async (email, newPassword) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !newPassword) {
    throw new ApiError(400, 'Vui lòng nhập email và mật khẩu mới');
  }
  if (String(newPassword).length < 6) {
    throw new ApiError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy tài khoản với email này');
  }
  if (user.role === 'admin') {
    throw new ApiError(403, 'Tài khoản quản trị vui lòng đổi mật khẩu trong hồ sơ cá nhân');
  }

  user.password = newPassword;
  await user.save();
  return { email: user.email, updated: true };
};

