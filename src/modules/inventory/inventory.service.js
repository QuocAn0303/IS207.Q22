const prisma = require('../../config/prisma');

const inventoryService = {
  // Lấy tồn kho theo sản phẩm
  getByProduct: async (productId) => {
    return await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true, initialStock: true }
    });
  },

  // Nhập kho (tăng số lượng)
  importStock: async (data, userId) => {
    const { productId, quantity, note } = data;
    return await prisma.$transaction(async (tx) => {
      // 1. Tăng tồn kho trong bảng Product (hoặc bảng Inventory riêng nếu có)
      const product = await tx.product.update({
        where: { id: productId },
        data: { initialStock: { increment: quantity } }
      });

      // 2. Ghi log giao dịch
      await tx.inventoryTransaction.create({
        data: {
          productId,
          type: 'IMPORT',
          quantity,
          note,
          userId
        }
      });
      return product;
    });
  },

  // Điều chỉnh kho (kiểm kho)
  adjustment: async (data, userId) => {
    const { productId, actualQuantity, note } = data;
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      const diff = actualQuantity - product.initialStock;

      await tx.product.update({
        where: { id: productId },
        data: { initialStock: actualQuantity }
      });

      await tx.inventoryTransaction.create({
        data: {
          productId,
          type: 'ADJUSTMENT',
          quantity: diff,
          note,
          userId
        }
      });
    });
  },

  // Lấy danh sách sản phẩm sắp hết hàng
  getLowStock: async (threshold = 10) => {
    return await prisma.product.findMany({
      where: { initialStock: { lte: threshold } }
    });
  },

  // Xem lịch sử giao dịch kho
  getTransactions: async (query) => {
    const { productId, type } = query;
    return await prisma.inventoryTransaction.findMany({
      where: {
        productId: productId || undefined,
        type: type || undefined
      },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
};

module.exports = inventoryService;