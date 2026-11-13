import { sendSuccess } from '../../utils/responseHandler.js';
import * as orderService from './order.service.js';
import { ENV } from '../../configs/env.config.js';

export const getPaymentConfig = async (req, res) => {
  sendSuccess(res, {
    bankBin: ENV.BANK_BIN,
    bankName: ENV.BANK_NAME,
    accountNumber: ENV.BANK_ACCOUNT_NUMBER,
    accountName: ENV.BANK_ACCOUNT_NAME,
  }, 'Lấy thông tin chuyển khoản thành công');
};

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    sendSuccess(res, order, 'Đặt hàng thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id, req.query);
    sendSuccess(res, orders, 'Lấy danh sách đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelUserOrder(req.user.id, req.params.id);
    sendSuccess(res, order, 'Hủy đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    sendSuccess(res, result, 'Lấy danh sách đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    sendSuccess(res, order, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderPaymentStatus(req.params.id, req.body.paymentStatus);
    sendSuccess(res, order, 'Cập nhật trạng thái thanh toán thành công');
  } catch (error) {
    next(error);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const stats = await orderService.getOrderStats();
    sendSuccess(res, stats, 'Lấy thống kê đơn hàng thành công');
  } catch (error) {
    next(error);
  }
};

