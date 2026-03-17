// src/modules/products/product.routes.js
const router = require('express').Router();
const { z } = require('zod');
const productService = require('./product.service');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { success, created, paginated } = require('../../utils/response');

const productSchema = z.object({
  sku: z.string().min(1, 'SKU không được để trống'),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  price: z.number().positive('Giá bán phải lớn hơn 0'),
  costPrice: z.number().positive('Giá vốn phải lớn hơn 0'),
  unit: z.string().default('cái'),
  categoryId: z.string().uuid('Category ID không hợp lệ'),
  initialStock: z.number().int().min(0).default(0),
});

router.use(authenticate);

// Xem danh sách - tất cả role
router.get('/', async (req, res, next) => {
  try {
    const { products, pagination } = await productService.getAll(req.query);
    paginated(res, products, pagination);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    success(res, product);
  } catch (err) { next(err); }
});

// Tạo/sửa/xóa - chỉ ADMIN và MANAGER
router.post('/', authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await productService.create(data);
    created(res, product, 'Tạo sản phẩm thành công');
  } catch (err) { next(err); }
});

router.put('/:id', authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    success(res, product, 'Cập nhật sản phẩm thành công');
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    success(res, null, 'Xóa sản phẩm thành công');
  } catch (err) { next(err); }
});

module.exports = router;
