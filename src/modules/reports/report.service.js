// src/modules/reports/report.service.js
const prisma = require("../../config/prisma");

// Helper: tránh lệch timezone UTC+7
const toLocalDateString = (date) =>
  date.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

const toLocalMonthString = (date) => toLocalDateString(date).slice(0, 7); // "YYYY-MM"

// ==================== GET REVENUE (theo ngày) ====================
const getRevenue = async (from, to) => {
  if (!from || !to) {
    throw {
      status: 400,
      message: "Vui lòng cung cấp ngày bắt đầu (from) và ngày kết thúc (to)",
    };
  }

  const startDate = new Date(from);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw { status: 400, message: "Định dạng ngày không hợp lệ" };
  }

  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: startDate, lte: endDate },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const revenueByDate = orders.reduce((acc, order) => {
    const dateStr = toLocalDateString(order.createdAt); // ✅ fix timezone
    acc[dateStr] = (acc[dateStr] || 0) + Number(order.total);
    return acc;
  }, {});

  return Object.keys(revenueByDate).map((date) => ({
    date,
    revenue: revenueByDate[date],
  }));
};

// ==================== GET REVENUE MONTHLY ====================
const getRevenueMonthly = async () => {
  // Giới hạn 12 tháng gần nhất, tránh load toàn bộ bảng
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: twelveMonthsAgo },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const revenueByMonth = orders.reduce((acc, order) => {
    const monthStr = toLocalMonthString(order.createdAt); // ✅ fix timezone
    acc[monthStr] = (acc[monthStr] || 0) + Number(order.total);
    return acc;
  }, {});

  return Object.keys(revenueByMonth).map((month) => ({
    month,
    revenue: revenueByMonth[month],
  }));
};

// ==================== GET TOP PRODUCTS ====================
const getTopProducts = async (limit = 10) => {
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: { id: true },
  });
  const orderIds = completedOrders.map((o) => o.id);

  if (orderIds.length === 0) return [];

  const topItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { orderId: { in: orderIds } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: Number(limit),
  });

  const productIds = topItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, sku: true },
  });

  return topItems.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      sku: product?.sku || "N/A",
      name: product?.name || "Sản phẩm không xác định",
      totalQuantitySold: item._sum.quantity || 0,
      totalRevenue: Number(item._sum.subtotal || 0),
    };
  });
};

// ==================== GET INVENTORY REPORT ====================
const getInventoryReport = async () => {
  const inventories = await prisma.inventory.findMany({
    where: {
      product: { isActive: true },
    },
    include: {
      product: { select: { id: true, name: true, sku: true, costPrice: true } },
    },
    orderBy: { quantity: "desc" },
  });

  const details = inventories.map((inv) => {
    const costPrice = Number(inv.product.costPrice || 0);
    const quantity = inv.quantity;
    return {
      productId: inv.product.id,
      sku: inv.product.sku,
      name: inv.product.name,
      quantity,
      costPrice,
      totalValue: quantity * costPrice,
    };
  });

  const summary = {
    totalItems: details.reduce((sum, item) => sum + item.quantity, 0),
    totalInventoryValue: details.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    ),
  };

  return { summary, details };
};

// ==================== EXPORT REVENUE -> EXCEL ====================
// Chú thích: hàm này tạo buffer Excel và trả về cho controller để stream về client
const exportRevenueExcel = async (from, to) => {
  const rows = await getRevenue(from, to); // [{date,revenue}, ...]
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP System";
  const ws = wb.addWorksheet("Doanh thu");

  // Header (tiếng Việt để người đọc dễ hiểu)
  ws.addRow(["Ngày", "Doanh thu (VND)"]);
  ws.getRow(1).font = { bold: true };

  rows.forEach((r) => {
    ws.addRow([r.date, Number(r.revenue)]);
  });

  // Tổng
  const total = rows.reduce((s, r) => s + Number(r.revenue), 0);
  ws.addRow([]);
  ws.addRow(["Tổng", total]);
  ws.getRow(ws.rowCount).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

// ==================== EXPORT INVENTORY -> EXCEL ====================
const exportInventoryExcel = async () => {
  const data = await getInventoryReport();
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "ERP System";

  // Summary sheet
  const s1 = wb.addWorksheet("Tổng quan tồn kho");
  s1.addRow(["Tổng số mặt hàng", data.summary.totalItems]);
  s1.addRow(["Tổng giá trị tồn kho (VND)", data.summary.totalInventoryValue]);

  // Details sheet
  const s2 = wb.addWorksheet("Chi tiết tồn kho");
  s2.addRow(["SKU", "Tên sản phẩm", "Số lượng", "Giá vốn", "Giá trị"]);
  s2.getRow(1).font = { bold: true };
  data.details.forEach((d) => {
    s2.addRow([d.sku, d.name, d.quantity, d.costPrice, d.totalValue]);
  });

  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

module.exports = {
  getRevenue,
  getRevenueMonthly,
  getTopProducts,
  getInventoryReport,
  exportRevenueExcel,
  exportInventoryExcel,
};
