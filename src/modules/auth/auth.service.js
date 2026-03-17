// src/modules/auth/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');

const login = async ({ email, password }) => {
  // 1. Tìm user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
  if (!user.isActive) throw { status: 403, message: 'Tài khoản đã bị vô hiệu hóa' };

  // 2. Kiểm tra password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };

  // 3. Tạo JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _, ...userInfo } = user;
  return { token, user: userInfo };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw { status: 404, message: 'Không tìm thấy người dùng' };
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw { status: 400, message: 'Mật khẩu hiện tại không đúng' };

  const hashed = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_ROUNDS) || 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: 'Đổi mật khẩu thành công' };
};

module.exports = { login, getProfile, changePassword };
