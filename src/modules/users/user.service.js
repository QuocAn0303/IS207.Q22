// src/modules/users/user.service.js
const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');

const getAll = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  const where = search
    ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
};

const create = async ({ email, password, fullName, role }) => {
  const hashed = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);
  return prisma.user.create({
    data: { email, password: hashed, fullName, role },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
  });
};

const update = async (id, data) => {
  const { password, ...rest } = data;
  const updateData = { ...rest };
  if (password) {
    updateData.password = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);
  }
  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });
};

const remove = async (id) => {
  // Soft delete - chỉ vô hiệu hóa tài khoản
  return prisma.user.update({ where: { id }, data: { isActive: false } });
};

module.exports = { getAll, create, update, remove };
