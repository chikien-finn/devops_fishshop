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

export const listActiveCoupons = async () => {
  const now = new Date();
  return Coupon.find({
    active: true,
    validFrom: { $lte: now },
    $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
  })
    .sort({ discountValue: -1 })
    .lean();
};

export const createCoupon = async (data) => {
  try {
    const payload = {
      code: String(data.code || '').trim().toUpperCase(),
      discountType: data.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(data.discountValue) || 0,
      minOrderAmount: Number(data.minOrderAmount) || 0,
      maxDiscount: data.maxDiscount && Number(data.maxDiscount) > 0 ? Number(data.maxDiscount) : null,
      usageLimit: data.usageLimit && Number(data.usageLimit) > 0 ? Number(data.usageLimit) : null,
      validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      active: data.active !== undefined ? Boolean(data.active) : true,
    };
    return await Coupon.create(payload);
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'Mã giảm giá đã tồn tại');
    throw error;
  }
};

export const updateCoupon = async (id, data) => {
  const update = { ...data };
  if (update.code) update.code = String(update.code).trim().toUpperCase();
  if (update.discountValue !== undefined) update.discountValue = Number(update.discountValue) || 0;
  if (update.minOrderAmount !== undefined) update.minOrderAmount = Number(update.minOrderAmount) || 0;
  if ('maxDiscount' in update) update.maxDiscount = update.maxDiscount && Number(update.maxDiscount) > 0 ? Number(update.maxDiscount) : null;
  if ('usageLimit' in update) update.usageLimit = update.usageLimit && Number(update.usageLimit) > 0 ? Number(update.usageLimit) : null;
  if ('validFrom' in update) update.validFrom = update.validFrom ? new Date(update.validFrom) : new Date();
  if ('validUntil' in update) update.validUntil = update.validUntil ? new Date(update.validUntil) : null;
  if (update.active !== undefined) update.active = Boolean(update.active);
  const coupon = await Coupon.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
  return coupon;
};

export const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
  return coupon;
};
