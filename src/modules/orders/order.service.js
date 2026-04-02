// src/modules/orders/order.service.js
const prisma = require('../../config/prisma');

// Tạo mã đơn hàng tự động: ORD-20240304-0001
const generateOrderCode = async () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await prisma.order.count({
    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });
  return `ORD-${today}-${String(count + 1).padStart(4, '0')}`;
};

const getAll = async ({ page = 1, limit = 20, status = '', customerId = '' }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(customerId && { customerId }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        createdBy: { select: { id: true, fullName: true } },
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, fullName: true } },
      items: { include: { product: true } },
    },
  });
  if (!order) throw { status: 404, message: 'Không tìm thấy đơn hàng' };
  return order;
};

const create = async (orderData, userId) => {
  const { customerId, items, paymentMethod, discount = 0, note } = orderData;

  // Kiểm tra sản phẩm và tính tiền
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { inventory: true },
  });

  if (products.length !== items.length) {
    throw { status: 400, message: 'Một số sản phẩm không tồn tại hoặc đã ngừng kinh doanh' };
  }

  // Kiểm tra tồn kho
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (product.inventory.quantity < item.quantity) {
      throw { status: 400, message: `Sản phẩm "${product.name}" không đủ số lượng tồn kho` };
    }
  }

  // Tính subtotal
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const subtotal = product.price * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price: product.price, subtotal };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const total = subtotal - Number(discount);
  if (total < 0) {
  throw { status: 400, message: 'Số tiền giảm giá không được lớn hơn tổng giá trị đơn hàng' };
  }
  const orderCode = await generateOrderCode();

  // Tạo order + cập nhật tồn kho trong 1 transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderCode,
        customerId,
        createdById: userId,
        paymentMethod,
        discount,
        subtotal,
        total,
        note,
        items: { create: orderItems },
      },
      include: { items: true, customer: true },
    });

    // Trừ tồn kho
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: product.inventory.id,
          type: 'EXPORT',
          quantity: item.quantity,
          note: `Bán hàng - đơn ${orderCode}`,
        },
      });
    }

    // Cập nhật totalSpent của khách hàng
    if (customerId) {
      await tx.customer.update({
        where: { id: customerId },
        data: { totalSpent: { increment: total } },
      });
    }

    return newOrder;
  });

  return order;
};

const updateStatus = async (id, status) => {
  const orderExists = await prisma.order.findUnique({ where: { id } });
  if (!orderExists) throw { status: 404, message: 'Không tìm thấy đơn hàng để cập nhật' };

  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

module.exports = { getAll, getById, create, updateStatus };
