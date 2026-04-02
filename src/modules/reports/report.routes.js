// src/modules/reports/report.routes.js
const router = require('express').Router();
const reportService = require('./report.service');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { success } = require('../../utils/response');

// Báo cáo là dữ liệu nhạy cảm, chỉ ADMIN và MANAGER mới được xem
router.use(authenticate, authorize('ADMIN', 'MANAGER'));

// GET /api/reports/revenue?from=2024-01-01&to=2024-01-31
router.get('/revenue', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportService.getRevenue(from, to);
    success(res, data, 'Lấy báo cáo doanh thu theo ngày thành công');
  } catch (err) { next(err); }
});

// GET /api/reports/revenue-monthly
router.get('/revenue-monthly', async (req, res, next) => {
  try {
    const data = await reportService.getRevenueMonthly();
    success(res, data, 'Lấy báo cáo doanh thu theo tháng thành công');
  } catch (err) { next(err); }
});

// GET /api/reports/top-products?limit=10
router.get('/top-products', async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const data = await reportService.getTopProducts(limit);
    success(res, data, 'Lấy danh sách sản phẩm bán chạy thành công');
  } catch (err) { next(err); }
});

// GET /api/reports/inventory
router.get('/inventory', async (req, res, next) => {
  try {
    const data = await reportService.getInventoryReport();
    success(res, data, 'Lấy báo cáo tồn kho thành công');
  } catch (err) { next(err); }
});

module.exports = router;