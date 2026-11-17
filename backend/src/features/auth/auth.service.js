import jwt from 'jsonwebtoken';
import { ENV } from '../../configs/env.config.js';
import { ApiError } from '../../utils/apiError.js';
import User from '../users/user.model.js';

export const register = async (userData) => {
  const { email, password, name, phone = '', address = '' } = userData;
  const cleanName = String(name || '').trim();
  if (cleanName.length < 2 || cleanName.length > 50) {
    throw new ApiError(400, 'Họ và tên phải từ 2 đến 50 ký tự');
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
    throw new ApiError(400, 'Địa chỉ email không đúng định dạng hoặc vượt quá 100 ký tự');
  }

  const cleanPassword = String(password || '');
  if (cleanPassword.length < 6 || cleanPassword.length > 64) {
    throw new ApiError(400, 'Mật khẩu phải từ 6 đến 64 ký tự');
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '').trim();
  if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
    throw new ApiError(400, 'Số điện thoại phải từ 10 đến 11 chữ số');
  }

  const cleanAddress = String(address || '').trim();
  if (cleanAddress.length > 200) {
    throw new ApiError(400, 'Địa chỉ tối đa 200 ký tự');
  }

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new ApiError(400, 'Email đã tồn tại trong hệ thống');
  }

  const user = await User.create({
    email: cleanEmail,
    password: cleanPassword,
    name: cleanName,
    phone: cleanPhone,
    address: cleanAddress,
  });
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
  const user = await User.findById(userId).select('-password').lean();
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
  }
  const passStr = String(newPassword);
  if (passStr.length < 6 || passStr.length > 64) {
    throw new ApiError(400, 'Mật khẩu mới phải từ 6 đến 64 ký tự');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Người dùng không tồn tại');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Mật khẩu hiện tại không chính xác');
  }

  user.password = passStr;
  await user.save();
  return { updated: true };
};

export const resetPasswordSimple = async (email, newPassword) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !newPassword) {
    throw new ApiError(400, 'Vui lòng nhập email và mật khẩu mới');
  }
  if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 100) {
    throw new ApiError(400, 'Địa chỉ email không đúng định dạng');
  }
  const passStr = String(newPassword);
  if (passStr.length < 6 || passStr.length > 64) {
    throw new ApiError(400, 'Mật khẩu mới phải từ 6 đến 64 ký tự');
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

