const router = require('express').Router();
const { z } = require('zod');
const customerService = require('./customer.service');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { paginated, created, success } = require('../../utils/response');

// Yêu cầu đăng nhập để thao tác với dữ liệu khách hàng, chỉ admin, manager, cashier mới được truy cập
router.use(authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'));

// API: GET /api/customers
router.get('/', async (req, res, next) => {
  try {
    const { customers, pagination } = await customerService.getAll(req.query);
    paginated(res, customers, pagination);
  } catch (err) {
    next(err);
  }
});


const createSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')), 
  address: z.string().optional(),
});

// API: POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const newCustomer = await customerService.create(validatedData);
    created(res, newCustomer, 'Thêm mới khách hàng thành công');
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').optional(),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  address: z.string().optional(),
});

// API: PUT /api/customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const updatedCustomer = await customerService.update(req.params.id, validatedData);
    success(res, updatedCustomer, 'Cập nhật thông tin khách hàng thành công');
  } catch (err) {
    next(err);
  }
});

module.exports = router;