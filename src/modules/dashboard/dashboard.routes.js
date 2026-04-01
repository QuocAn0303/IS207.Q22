// src/modules/dashboard/dashboard.routes.js
const router = require('express').Router();
const prisma = require('../../config/prisma');
const { authenticate } = require('../../middleware/auth.middleware');
const { success } = require('../../utils/response');

router.use(authenticate);

// Helper function: Lấy ngày YYYY-MM-DD theo giờ Local (Tránh lỗi UTC Timezone)
const getLocalDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==================== GET /api/dashboard/overview ====================
router.get('/overview', async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalProducts,
      totalCustomers,
      todayOrderStats,
      monthRevenue,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count(),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          status: { not: 'CANCELLED' },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: 'COMPLETED',
        },
        _sum: { total: true },
      }),
      // Lấy 5 sản phẩm tồn kho thấp nhất (ngưỡng <= 10)
      prisma.inventory.findMany({
        where: { quantity: { lte: 10 } },
        include: { product: { select: { name: true, sku: true } } },
        take: 5,
        orderBy: { quantity: 'asc' },
      }),
    ]);

    success(res, {
      totalProducts,
      totalCustomers,
      todayOrders: todayOrderStats._count.id ?? 0,
      todayRevenue: Number(todayOrderStats._sum.total ?? 0),
      monthRevenue: Number(monthRevenue._sum.total ?? 0),
      lowStockProducts,
    });
  } catch (err) { next(err); }
});

// ==================== GET /api/dashboard/revenue ====================
router.get('/revenue', async (req, res, next) => {
  try {
    const today = new Date();
    // Lùi về 6 ngày trước (tổng là 7 ngày tính cả hôm nay)
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    // Dùng 1 Query duy nhất lấy toàn bộ đơn hàng trong 7 ngày
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'COMPLETED',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Tạo sẵn 7 slot ngày (để những ngày không có đơn vẫn hiện $0 trên biểu đồ)
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = getLocalDateString(d); // 👈 Sử dụng hàm Local Date
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    // Gán từng đơn hàng vào đúng ngày
    for (const order of orders) {
      const key = getLocalDateString(order.createdAt); // 👈 Sử dụng hàm Local Date
      if (dailyMap[key]) {
        dailyMap[key].revenue += Number(order.total);
        dailyMap[key].orders += 1;
      }
    }

    const result = Object.values(dailyMap);

    const summary = {
      totalRevenue: result.reduce((sum, d) => sum + d.revenue, 0),
      totalOrders: result.reduce((sum, d) => sum + d.orders, 0),
    };

    success(res, { summary, daily: result });
  } catch (err) { next(err); }
});

module.exports = router;