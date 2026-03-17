// src/middleware/error.middleware.js
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `Dữ liệu đã tồn tại: ${err.meta?.target}`,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
    }
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
  });
};

module.exports = errorHandler;
