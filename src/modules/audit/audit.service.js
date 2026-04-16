// src/modules/audit/audit.service.js
// Chức năng: ghi và truy vấn audit log (activity trail)
// Ghi chú (tiếng Việt) có trong hàm để người khác dễ hiểu
const prisma = require("../../config/prisma");

/**
 * Ghi một bản ghi audit
 * @param {Object} params
 * @param {string} params.userId - id người thực hiện (có thể null nếu hệ thống)
 * @param {string} params.action - hành động, ví dụ 'CREATE_ORDER'
 * @param {string} params.entity - tên entity, ví dụ 'Order'
 * @param {string} params.entityId - id của entity liên quan
 * @param {Object} params.before - trạng thái trước (sẽ lưu dưới dạng JSON)
 * @param {Object} params.after - trạng thái sau (sẽ lưu dưới dạng JSON)
 * @param {Object} params.meta - metadata bổ sung (ip, note...)
 */
const log = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  before = null,
  after = null,
  meta = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        beforeJson: before,
        afterJson: after,
        meta,
      },
    });
  } catch (err) {
    // Không throw để tránh làm hỏng luồng chính; chỉ log ra console
    console.error("Audit log error:", err);
  }
};

// Lấy danh sách audit log (phân trang, admin)
const getAll = async ({ page = 1, limit = 50 }) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Math.min(200, Number(limit) || 50));
  const skip = (p - 1) * l;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: l,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
  };
};

module.exports = { log, getAll };
