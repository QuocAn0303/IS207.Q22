const {
  createShiftSchema,
  createViolationSchema,
  generatePayrollSchema,
} = require("./hr.validation");
const hrService = require("./hr.service");
const prisma = require("../../config/prisma");

const setEmployeeCounts = async (req, res, next) => {
  try {
    const { setCountsSchema } = require("./hr.validation");
    const parsed = setCountsSchema.parse(req.body);
    const id = req.params.id;

    const now = new Date();
    const month = parsed.month || now.getMonth() + 1;
    const year = parsed.year || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const desiredShifts = parsed.shiftCount;
    const desiredViolations = parsed.violationCount;
    const shiftType = parsed.shiftType || "MORNING";
    const violationType = parsed.violationType || "LATE";
    const note = parsed.note || "Added by admin";

    await prisma.$transaction(async (tx) => {
      // SHIFTS
      if (typeof desiredShifts === "number") {
        const existingShifts = await tx.shift.findMany({
          where: { employeeId: id, date: { gte: start, lt: end } },
          orderBy: { date: "asc" },
        });
        const cur = existingShifts.length;
        if (desiredShifts > cur) {
          const toCreate = desiredShifts - cur;
          const existingDays = new Set(
            existingShifts.map((s) => new Date(s.date).getDate()),
          );
          const daysInMonth = new Date(year, month, 0).getDate();
          const creations = [];
          for (
            let d = 1;
            d <= daysInMonth && creations.length < toCreate;
            d++
          ) {
            if (!existingDays.has(d)) {
              const date = new Date(year, month - 1, d);
              creations.push(
                tx.shift.create({
                  data: { employeeId: id, date, type: shiftType },
                }),
              );
            }
          }
          await Promise.all(creations);
        } else if (desiredShifts < cur) {
          const toDelete = cur - desiredShifts;
          // delete newest shifts first
          const toRemove = existingShifts.slice(-toDelete);
          for (const r of toRemove) {
            await tx.shift.delete({ where: { id: r.id } });
          }
        }
      }

      // VIOLATIONS
      if (typeof desiredViolations === "number") {
        const existingViolations = await tx.violation.findMany({
          where: { employeeId: id, date: { gte: start, lt: end } },
          orderBy: { date: "asc" },
        });
        const curV = existingViolations.length;
        if (desiredViolations > curV) {
          const toCreate = desiredViolations - curV;
          const creations = [];
          for (let i = 0; i < toCreate; i++) {
            const penalty =
              violationType === "PACKING_ERROR" ||
              violationType === "DAMAGED_GOODS"
                ? 500000
                : 0;
            creations.push(
              tx.violation.create({
                data: {
                  employeeId: id,
                  type: violationType,
                  note,
                  penalty,
                },
              }),
            );
          }
          await Promise.all(creations);
        } else if (desiredViolations < curV) {
          const toDelete = curV - desiredViolations;
          const toRemove = existingViolations.slice(-toDelete);
          for (const r of toRemove) {
            await tx.violation.delete({ where: { id: r.id } });
          }
        }
      }
    });

    const updated = await prisma.employee.findUnique({
      where: { id },
      include: { user: true, shifts: true, violations: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const setBulkCounts = async (req, res, next) => {
  try {
    const { setCountsBulkSchema } = require("./hr.validation");
    const parsed = setCountsBulkSchema.parse(req.body);

    const now = new Date();
    const month = parsed.month || now.getMonth() + 1;
    const year = parsed.year || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const desiredShifts = parsed.shiftCount;
    const desiredViolations = parsed.violationCount;
    const shiftType = parsed.shiftType || "MORNING";
    const violationType = parsed.violationType || "LATE";
    const note = parsed.note || "Added by admin (bulk)";

    // Process each employee sequentially (each in its own transaction)
    for (const id of parsed.employeeIds) {
      await prisma.$transaction(async (tx) => {
        // SHIFTS
        if (typeof desiredShifts === "number") {
          const existingShifts = await tx.shift.findMany({
            where: { employeeId: id, date: { gte: start, lt: end } },
            orderBy: { date: "asc" },
          });
          const cur = existingShifts.length;
          if (desiredShifts > cur) {
            const toCreate = desiredShifts - cur;
            const existingDays = new Set(
              existingShifts.map((s) => new Date(s.date).getDate()),
            );
            const daysInMonth = new Date(year, month, 0).getDate();
            const creations = [];
            for (
              let d = 1;
              d <= daysInMonth && creations.length < toCreate;
              d++
            ) {
              if (!existingDays.has(d)) {
                const date = new Date(year, month - 1, d);
                creations.push(
                  tx.shift.create({
                    data: { employeeId: id, date, type: shiftType },
                  }),
                );
              }
            }
            await Promise.all(creations);
          } else if (desiredShifts < cur) {
            const toDelete = cur - desiredShifts;
            const toRemove = existingShifts.slice(-toDelete);
            for (const r of toRemove) {
              await tx.shift.delete({ where: { id: r.id } });
            }
          }
        }

        // VIOLATIONS
        if (typeof desiredViolations === "number") {
          const existingViolations = await tx.violation.findMany({
            where: { employeeId: id, date: { gte: start, lt: end } },
            orderBy: { date: "asc" },
          });
          const curV = existingViolations.length;
          if (desiredViolations > curV) {
            const toCreate = desiredViolations - curV;
            const creations = [];
            for (let i = 0; i < toCreate; i++) {
              const penalty =
                violationType === "PACKING_ERROR" ||
                violationType === "DAMAGED_GOODS"
                  ? 500000
                  : 0;
              creations.push(
                tx.violation.create({
                  data: {
                    employeeId: id,
                    type: violationType,
                    note,
                    penalty,
                  },
                }),
              );
            }
            await Promise.all(creations);
          } else if (desiredViolations < curV) {
            const toDelete = curV - desiredViolations;
            const toRemove = existingViolations.slice(-toDelete);
            for (const r of toRemove) {
              await tx.violation.delete({ where: { id: r.id } });
            }
          }
        }
      });
    }

    const updated = await prisma.employee.findMany({
      where: { id: { in: parsed.employeeIds } },
      include: { user: true, shifts: true, violations: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const createShift = async (req, res, next) => {
  try {
    const parsed = createShiftSchema.parse(req.body);
    const date = parsed.date ? new Date(parsed.date) : new Date();
    const shift = await prisma.shift.create({
      data: { employeeId: parsed.employeeId, date, type: parsed.type },
    });
    res.json({ success: true, data: shift });
  } catch (err) {
    next(err);
  }
};

const createViolation = async (req, res, next) => {
  try {
    const parsed = createViolationSchema.parse(req.body);
    // set default penalty for packing/damage
    let penalty = 0;
    if (parsed.type === "PACKING_ERROR" || parsed.type === "DAMAGED_GOODS")
      penalty = 500000;
    const rec = await prisma.violation.create({
      data: {
        employeeId: parsed.employeeId,
        type: parsed.type,
        note: parsed.note,
        penalty,
      },
    });
    res.json({ success: true, data: rec });
  } catch (err) {
    next(err);
  }
};

const updateViolation = async (req, res, next) => {
  try {
    const { updateViolationSchema } = require("./hr.validation");
    const parsed = updateViolationSchema.parse(req.body);
    const id = req.params.id;

    const allowed = {};
    if (parsed.type !== undefined) allowed.type = parsed.type;
    if (parsed.note !== undefined) allowed.note = parsed.note;
    if (parsed.penalty !== undefined) allowed.penalty = parsed.penalty;

    const updated = await prisma.violation.update({
      where: { id },
      data: allowed,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const generatePayroll = async (req, res, next) => {
  try {
    const parsed = generatePayrollSchema.parse(req.body);
    const out = await hrService.generatePayrollForMonth(
      parsed.month,
      parsed.year,
    );
    res.json({ success: true, data: out });
  } catch (err) {
    next(err);
  }
};

const listEmployees = async (req, res, next) => {
  try {
    const out = await hrService.listEmployeesWithPreview();
    // If the requester is not ADMIN or MANAGER, only return their own employee record
    const role = req.user?.role;
    if (role === "ADMIN" || role === "MANAGER") {
      res.json({ success: true, data: out });
    } else {
      const filtered = out.filter((r) => r.employee.user.id === req.user?.id);
      res.json({ success: true, data: filtered });
    }
  } catch (err) {
    next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { updateEmployeeSchema } = require("./hr.validation");
    const parsed = updateEmployeeSchema.parse(req.body);
    const id = req.params.id;
    const data = {};
    if (parsed.baseSalary !== undefined) data.baseSalary = parsed.baseSalary;
    if (parsed.shiftMoney !== undefined) data.shiftMoney = parsed.shiftMoney;
    if (parsed.isActive !== undefined) data.isActive = parsed.isActive;
    const updated = await prisma.employee.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShift,
  createViolation,
  updateViolation,
  generatePayroll,
  listEmployees,
  updateEmployee,
  setEmployeeCounts,
  setBulkCounts,
};
