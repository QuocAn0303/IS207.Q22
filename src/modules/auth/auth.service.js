// src/modules/auth/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");

// ─────────────────────────────────────────────────────────────
// LOGIN
// Nhận vào { email, password }
// Trả về   { token, user }
// ─────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  // 1. Tìm user theo email trong database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Không tìm thấy → báo lỗi chung (không nói rõ email sai hay pass sai)
  //    Mục đích: tránh hacker biết email nào tồn tại trong hệ thống
  if (!user) {
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  }

  // 3. Tài khoản bị vô hiệu hóa (isActive = false)
  if (!user.isActive) {
    throw { status: 403, message: "Tài khoản đã bị vô hiệu hóa" };
  }

  if (!user) {
    throw { status: 404, message: "Không tìm thấy người dùng" };
  }

  // 4. So sánh password người dùng nhập với hash trong database
  //    bcrypt.compare(plainText, hash) → trả true nếu khớp, false nếu không
  //    KHÔNG BAO GIỜ lưu password thẳng vào DB — luôn lưu hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: 401, message: "Email hoặc mật khẩu không đúng" };
  }

  // 5. Tạo JWT token
  //    Payload = dữ liệu được mã hóa trong token — middleware sẽ decode sau
  //    Chỉ put những gì cần thiết vào payload, KHÔNG put password
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, // dùng để authorize (check quyền) sau này
    },
    process.env.JWT_SECRET, // key bí mật trong .env
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }, // hết hạn sau 7 ngày
  );

  // 6. Trả về token + user info
  //    Destructure để bỏ field password ra khỏi object trước khi trả về FE
  const { password: _removed, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE
// Dùng khi FE gọi GET /api/auth/me — lấy thông tin user đang đăng nhập
// userId lấy từ req.user.id (do middleware authenticate gắn vào)
// ─────────────────────────────────────────────────────────────
const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
      // password không có trong select → Prisma tự bỏ qua
    },
  });

  if (!user) {
    throw { status: 404, message: "Không tìm thấy người dùng" };
  }

  return user;
};

// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────────────────────
const changePassword = async (userId, { currentPassword, newPassword }) => {
  // 1. Lấy user — cần lấy cả password hash để verify
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw { status: 404, message: "Không tìm thấy người dùng" };
  }

  // xét mật khẩu mới phải khác mật khẩu hiện tại
  if (currentPassword === newPassword) {
    throw { status: 400, message: "Mật khẩu mới phải khác mật khẩu hiện tại" };
  }

  // 2. Kiểm tra mật khẩu hiện tại có đúng không
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw { status: 400, message: "Mật khẩu hiện tại không đúng" };
  }

  // 3. Hash mật khẩu mới trước khi lưu
  //    Số 10 = salt rounds — càng cao càng an toàn nhưng càng chậm
  const hashedNewPassword = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_ROUNDS) || 10,
  );

  // 4. Cập nhật vào database
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: "Đổi mật khẩu thành công" };
};

module.exports = { login, getProfile, changePassword };
