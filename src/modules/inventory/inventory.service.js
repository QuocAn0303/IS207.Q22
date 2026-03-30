const prisma = require('../../config/prisma');

const inventoryService = {
  getByProduct: async (productId) => {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: { product: { select: { name: true, sku: true } } }
    });
    if (!inventory) throw { status: 404, message: "Không tìm thấy thông tin kho của sản phẩm này." };
    return inventory;
  },

  // Truyền thêm userId vào để tracking
  importStock: async (data, userId) => {
    const { productId, quantity, note } = data;
    
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) throw { status: 404, message: "Không tìm thấy thông tin kho của sản phẩm này." };

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: { increment: quantity } }
      });

      //Ghi nhận chính xác ai nhập kho
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: updatedInventory.id,
          type: "IMPORT",
          quantity: quantity,
          note: note,
          createdById: userId 
        }
      });

      return updatedInventory;
    });
  },

  // Truyền thêm userId vào để tracking
  adjustment: async (data, userId) => {
    const { productId, actualQuantity, note } = data;
    
    return await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) throw { status: 404, message: "Không tìm thấy thông tin kho của sản phẩm này." };

      const diff = actualQuantity - inventory.quantity;

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: actualQuantity }
      });

      //Ghi nhận chính xác ai kiểm kho
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: 'ADJUSTMENT',
          quantity: diff, 
          note: note,
          createdById: userId 
        }
      });

      return updatedInventory;
    });
  },

  getLowStock: async (threshold = 10) => {
    return await prisma.inventory.findMany({
      where: { quantity: { lte: threshold } },
      include: { product: { select: { name: true, sku: true, isActive: true } } },
      orderBy: { quantity: 'asc' }
    });
  },

  getTransactions: async (query) => {
    const { inventoryId, type } = query;
    // Fix: Ép kiểu an toàn, nếu truyền character (NaN) thì lấy mặc định là 1 và 20
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);
    const skip = (page - 1) * limit;
    
    const where = {
      ...(inventoryId && { inventoryId }),
      ...(type && { type })
    };

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: Number(limit),
        include: { 
          inventory: { include: { product: { select: { name: true, sku: true } } } },
          createdBy: { select: { fullName: true, role: true } } // 👉 Kéo ra tên và quyền của người thao tác
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryTransaction.count({ where })
    ]);

    return {
      transactions,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    };
  }
};

module.exports = inventoryService;