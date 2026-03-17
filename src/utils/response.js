// src/utils/response.js

const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Tạo thành công') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Lỗi', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

const paginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination, // { page, limit, total, totalPages }
  });
};

module.exports = { success, created, error, paginated };
