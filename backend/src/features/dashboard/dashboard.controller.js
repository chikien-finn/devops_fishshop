import { sendSuccess } from '../../utils/responseHandler.js';
import * as dashboardService from './dashboard.service.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    sendSuccess(res, stats, 'Lấy thống kê Dashboard thành công');
  } catch (error) {
    next(error);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const orders = await dashboardService.getRecentOrders(limit);
    sendSuccess(res, orders, 'Lấy danh sách 5 đơn hàng mới nhất thành công');
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const products = await dashboardService.getTopSellingProducts(limit);
    sendSuccess(res, products, 'Lấy danh sách top sản phẩm bán chạy thành công');
  } catch (error) {
    next(error);
  }
};
