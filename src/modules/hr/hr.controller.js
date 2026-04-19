const {
  createShiftSchema,
  createViolationSchema,
  generatePayrollSchema,
} = require("./hr.validation");
const hrService = require("./hr.service");
const prisma = require("../../config/prisma");

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
    res.json({ success: true, data: out });
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
  generatePayroll,
  listEmployees,
  updateEmployee,
};
