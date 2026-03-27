const router = require('express').Router();
const inventoryService = require('./inventory.service');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { success } = require('../../utils/response');

router.use(authenticate);

// Nhập kho - ADMIN, MANAGER, WAREHOUSE
router.post('/import', authorize('ADMIN', 'WAREHOUSE'), async (req, res, next) => {
  try {
    const result = await inventoryService.importStock(req.body, req.user.id);
    success(res, result, 'Nhập kho thành công');
  } catch (err) { next(err); }
});

// Kiểm kho/Điều chỉnh
router.post('/adjust', authorize('ADMIN', 'WAREHOUSE'), async (req, res, next) => {
  try {
    const result = await inventoryService.adjustment(req.body, req.user.id);
    success(res, result, 'Điều chỉnh kho thành công');
  } catch (err) { next(err); }
});

// Lấy danh sách hàng sắp hết
router.get('/low-stock', authorize('ADMIN', 'WAREHOUSE', 'MANAGER'), async (req, res, next) => {
  try {
    const products = await inventoryService.getLowStock(req.query.threshold);
    success(res, products);
  } catch (err) { next(err); }
});

// Xem lịch sử giao dịch
router.get('/transactions', authorize('ADMIN', 'WAREHOUSE'), async (req, res, next) => {
  try {
    const logs = await inventoryService.getTransactions(req.query);
    success(res, logs);
  } catch (err) { next(err); }
});

module.exports = router;