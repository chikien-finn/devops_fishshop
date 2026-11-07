import { sendSuccess } from '../../utils/responseHandler.js';
import * as productService from './product.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    sendSuccess(res, products, 'Lấy danh sách sản phẩm thành công');
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

