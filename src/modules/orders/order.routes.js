// src/modules/orders/order.routes.js
const router = require('express').Router();
const { z } = require('zod');
const orderService = require('./order.service');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { success, created, paginated } = require('../../utils/response');

const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']).default('CASH'),
  discount: z.number().min(0).default(0),
  note: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
  })).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { orders, pagination } = await orderService.getAll(req.query);
    paginated(res, orders, pagination);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getById(req.params.id);
    success(res, order);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.create(data, req.user.id);
    created(res, order, 'Tạo đơn hàng thành công');
  } catch (err) { next(err); }
});

router.patch('/:id/status', authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']),
    }).parse(req.body);
    const order = await orderService.updateStatus(req.params.id, status);
    success(res, order, 'Cập nhật trạng thái thành công');
  } catch (err) { next(err); }
});

module.exports = router;
