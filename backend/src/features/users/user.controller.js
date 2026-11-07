import { sendSuccess } from '../../utils/responseHandler.js';
import * as userService from './user.service.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, users, 'Lấy danh sách người dùng thành công');
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
