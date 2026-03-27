// src/modules/products/product.service.js
const prisma = require('../../config/prisma');

const getAll = async ({ page = 1, limit = 20, search = '', categoryId = '' }) => {
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] }),
    ...(categoryId && { categoryId }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        category: { select: { id: true, name: true } },
        inventory: { select: { quantity: true, minStock: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

const getById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, inventory: true },
  });
  if (!product) throw { status: 404, message: 'Không tìm thấy sản phẩm' };
  return product;
};

const create = async (data) => {
  return await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      price: data.price,
      costPrice: data.costPrice,
      categoryId: data.categoryId,
      
      inventory: {
        create: {
          quantity: 0
        }
      }
    }
  });
};

const update = async (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true, inventory: true },
  });
};

const remove = async (id) => {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
};

module.exports = { getAll, getById, create, update, remove };
