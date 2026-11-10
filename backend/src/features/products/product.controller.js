import { sendSuccess } from '../../utils/responseHandler.js';
import { ApiError } from '../../utils/apiError.js';
import * as productService from './product.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    sendSuccess(res, result, 'Lấy danh sách sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const getHomeProducts = async (req, res, next) => {
  try {
    const sections = await productService.getHomeSections();
    sendSuccess(res, sections, 'Lấy sản phẩm trang chủ thành công');
  } catch (error) {
    next(error);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    sendSuccess(res, stats, 'Lấy thống kê sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    sendSuccess(res, product, 'Lấy thông tin sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    sendSuccess(res, newProduct, 'Tạo sản phẩm mới thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Vui lòng chọn file ảnh để tải lên');
    }
    sendSuccess(
      res,
      { url: `/uploads/${req.file.filename}`, filename: req.file.filename },
      'Tải ảnh lên thành công',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    sendSuccess(res, updated, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const isHard = req.query.hard === 'true';
    await productService.deleteProduct(req.params.id, isHard);
    sendSuccess(res, null, 'Xóa sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

