import { sendSuccess } from '../../utils/responseHandler.js';
import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Đăng ký tài khoản thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Đăng nhập thành công');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, result, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.resetPasswordSimple(email, newPassword);
    sendSuccess(res, result, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

