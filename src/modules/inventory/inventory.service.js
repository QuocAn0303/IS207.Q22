const prisma = require('../../config/prisma');

const inventoryService = {
  // Lấy tồn kho theo sản phẩm
  getByProduct: async (productId) => {
    return await prisma.inventory.findUnique({
      where: { productId },
      include: { 
        product: { select: { name: true, sku: true } } 
      }
    });
  },

  importStock: async (data, userId) => {
    const { productId, quantity, note } = data;
    
    return await prisma.$transaction(async (tx) => {

      const inventory = await tx.inventory.findUnique({
        where: { productId }
      });

      if (!inventory) {
        const err = new Error("Không tìm thấy thông tin kho của sản phẩm này.");
        err.status = 404;
        throw err;
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { increment: quantity } }
      });

      await tx.inventoryTransaction.create({
        data: {
        inventoryId: updatedInventory.id, // 👉 Lấy thẳng ID của kho vừa được update
        type: "IMPORT",
        quantity: data.quantity,
        note: data.note,
        }
      });

return updatedInventory;
      
      return updatedInventory;
    });
  },

  // Điều chỉnh kho (kiểm kho)
  adjustment: async (data, userId) => {
    const { productId, actualQuantity, note } = data;
    
    return await prisma.$transaction(async (tx) => {
      // 1. Lấy thông tin kho hiện tại
      const inventory = await tx.inventory.findUnique({ 
        where: { productId } 
      });

      if (!inventory) {
        const err = new Error("Không tìm thấy thông tin kho của sản phẩm này.");
        err.status = 404;
        throw err;
      }

      // 2. Tính toán độ chênh lệch (Thực tế trừ đi trên phần mềm)
      const diff = actualQuantity - inventory.quantity;

      // 3. Cập nhật số lượng thực tế đè lên số cũ
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: actualQuantity }
      });

      // 4. Ghi log (Số lượng lúc này lưu độ chênh lệch: có thể âm hoặc dương)
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: 'ADJUSTMENT',
          quantity: diff, 
          note,
          userId
        }
      });

      return updatedInventory; // Đã bổ sung return
    });
  },

  // Lấy danh sách sản phẩm sắp hết hàng
  getLowStock: async (threshold = 10) => {
    return await prisma.inventory.findMany({
      where: { quantity: { lte: threshold } },
      include: { 
        product: { select: { name: true, sku: true } } 
      },
      orderBy: { quantity: 'asc' }
    });
  },

  // Xem lịch sử giao dịch kho
  getTransactions: async (query) => {
    const { inventoryId, type } = query;
    return await prisma.inventoryTransaction.findMany({
      where: {
        inventoryId: inventoryId || undefined,
        type: type || undefined
      },
      include: { 
        user: { select: { name: true } }, 
        inventory: { include: { product: { select: { name: true, sku: true } } } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }
};

module.exports = inventoryService;