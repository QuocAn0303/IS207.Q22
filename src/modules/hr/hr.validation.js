const { z } = require("zod");

const createShiftSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().optional(),
  type: z.enum(["MORNING", "AFTERNOON", "NIGHT"]),
});

const createViolationSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum([
    "LATE",
    "EARLY",
    "PACKING_ERROR",
    "DAMAGED_GOODS",
    "UNAUTHORIZED_ABSENCE",
  ]),
  note: z.string().optional(),
});

const generatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
});

const updateEmployeeSchema = z.object({
  baseSalary: z.number().nonnegative().optional(),
  shiftMoney: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createShiftSchema,
  createViolationSchema,
  generatePayrollSchema,
  updateEmployeeSchema,
};
