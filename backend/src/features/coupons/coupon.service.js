import Coupon from './coupon.model.js';
import { ApiError } from '../../utils/apiError.js';

export const calculateCouponDiscount = (coupon, subtotal) => {
  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}đ để dùng mã này`);
  }
  const discount = coupon.discountType === 'percentage'
    ? subtotal * coupon.discountValue / 100
    : coupon.discountValue;
  return Math.min(Math.round(discount), coupon.maxDiscount || Infinity, subtotal);
};

export const getValidCoupon = async (code, subtotal) => {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) throw new ApiError(400, 'Vui lòng nhập mã giảm giá');
  const now = new Date();
  const coupon = await Coupon.findOne({
    code: normalizedCode,
    active: true,
    validFrom: { $lte: now },
    $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    $expr: { $or: [{ $eq: ['$usageLimit', null] }, { $lt: ['$usedCount', '$usageLimit'] }] },
  }).lean();
  if (!coupon) throw new ApiError(404, 'Mã giảm giá không hợp lệ, đã hết hạn hoặc hết lượt sử dụng');
  return { coupon, discountAmount: calculateCouponDiscount(coupon, subtotal) };
};

export const listCoupons = () => Coupon.find().sort({ createdAt: -1 }).lean();

export const createCoupon = async (data) => {
  try {
    return await Coupon.create({ ...data, code: String(data.code || '').trim().toUpperCase() });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'Mã giảm giá đã tồn tại');
    throw error;
  }
};

export const updateCoupon = async (id, data) => {
  const update = { ...data };
  if (update.code) update.code = String(update.code).trim().toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
  return coupon;
};
