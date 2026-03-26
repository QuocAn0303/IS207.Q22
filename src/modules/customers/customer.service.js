// src/modules/customers/customer.service.js
const prisma = require('../../config/prisma');

//Lấy danh sách khách hàng

const getAll = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        totalSpent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//Thêm khách hàng mới

const create = async (data) => {

  const cleanData = { ...data };
  
  if (cleanData.phone === '') {
    cleanData.phone = null;
  }
  
  if (cleanData.email === '') {
    cleanData.email = null;
  }
  return prisma.customer.create({
    data: cleanData,
  });
};

//Cập nhật thông tin khách hàng

const update = async (id, data) => {

  const { totalSpent, ...cleanData } = data;

  if (cleanData.phone === '') cleanData.phone = null;
  if (cleanData.email === '') cleanData.email = null;

  return prisma.customer.update({
    where: { id },
    data: cleanData,
  });
};

module.exports = {
  getAll,
  create,
  update,
};