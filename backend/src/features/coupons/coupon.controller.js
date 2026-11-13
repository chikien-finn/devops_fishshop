import { sendSuccess } from '../../utils/responseHandler.js';
import * as couponService from './coupon.service.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const result = await couponService.getValidCoupon(req.body.code, Number(req.body.subtotal) || 0);
    sendSuccess(res, {
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountAmount: result.discountAmount,
    }, 'Áp dụng mã giảm giá thành công');
  } catch (error) { next(error); }
};

export const listCoupons = async (req, res, next) => {
  try { sendSuccess(res, await couponService.listCoupons()); } catch (error) { next(error); }
};

export const createCoupon = async (req, res, next) => {
  try { sendSuccess(res, await couponService.createCoupon(req.body), 'Tạo mã giảm giá thành công', 201); } catch (error) { next(error); }
};

export const updateCoupon = async (req, res, next) => {
  try { sendSuccess(res, await couponService.updateCoupon(req.params.id, req.body), 'Cập nhật mã giảm giá thành công'); } catch (error) { next(error); }
};
