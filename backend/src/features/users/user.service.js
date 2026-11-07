import User from './user.model.js';
import { ApiError } from '../../utils/apiError.js';

export const getAllUsers = async () => {
  return await User.find().select('-password').sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
  return user;
};

export const updateUserProfile = async (id, updateData) => {
  delete updateData.password;
  delete updateData.role;
  const user = await User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).select('-password');
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
  return user;
};

export const updateUserRole = async (id, role) => {
  if (!['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Quyền người dùng không hợp lệ');
  }
  const user = await User.findByIdAndUpdate(id, { role }, { returnDocument: 'after' }).select('-password');
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, 'Không tìm thấy người dùng');
  return user;
};
