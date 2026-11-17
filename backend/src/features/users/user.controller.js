import { sendSuccess } from '../../utils/responseHandler.js';
import * as userService from './user.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    sendSuccess(res, result, 'Lấy danh sách người dùng thành công');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    sendSuccess(res, user, 'Lấy thông tin tài khoản thành công');
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (req.user.id !== targetId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin tài khoản này',
      });
    }
    const user = await userService.getUserById(targetId);
    sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    sendSuccess(res, updated, 'Cập nhật thông tin thành công');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const updated = await userService.updateUserRole(req.params.id, req.body.role);
    sendSuccess(res, updated, 'Cập nhật phân quyền thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, null, 'Xóa người dùng thành công');
  } catch (error) {
    next(error);
  }
};
