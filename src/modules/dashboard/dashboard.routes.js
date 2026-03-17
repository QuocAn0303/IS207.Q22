// src/modules/dashboard/dashboard.routes.js
const router = require('express').Router();
const prisma = require('../../config/prisma');
const { authenticate } = require('../../middleware/auth.middleware');
const { success } = require('../../utils/response');

router.use(authenticate);

// Tổng quan dashboard
router.get('/overview', async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalProducts,
      totalCustomers,
      todayOrders,
      monthRevenue,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay }, status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      prisma.inventory.findMany({
        where: { quantity: { lte: prisma.inventory.fields.minStock } },
        include: { product: { select: { name: true, sku: true } } },
        take: 5,
      }),
    ]);

    success(res, {
      totalProducts,
      totalCustomers,
      todayOrders,
      monthRevenue: monthRevenue._sum.total || 0,
      lowStockProducts,
    });
  } catch (err) { next(err); }
});

// Doanh thu theo ngày (7 ngày gần nhất)
router.get('/revenue', async (req, res, next) => {
  try {
    const days = 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const revenue = await prisma.order.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: 'COMPLETED' },
        _sum: { total: true },
        _count: true,
      });

      result.push({
        date: start.toISOString().slice(0, 10),
        revenue: revenue._sum.total || 0,
        orders: revenue._count,
      });
    }

    success(res, result);
  } catch (err) { next(err); }
});

module.exports = router;
