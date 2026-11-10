import User from './user.model.js';
import { ApiError } from '../../utils/apiError.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAllUsers = async (filters = {}) => {
  const query = {};
  if (filters.role && filters.role !== 'all') {
    query.role = filters.role;
  }
  if (filters.search) {
    const regex = new RegExp(escapeRegex(String(filters.search).trim()), 'i');
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [items, totalItems, total, adminCount, customerCount, withPhoneCount] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.estimatedDocumentCount(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ phone: { $nin: ['', null] } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
    stats: {
      total,
      adminCount,
      customerCount,
      withPhoneCount,
    },
  };
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
