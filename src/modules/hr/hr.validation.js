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

const updateViolationSchema = z.object({
  type: z
    .enum([
      "LATE",
      "EARLY",
      "PACKING_ERROR",
      "DAMAGED_GOODS",
      "UNAUTHORIZED_ABSENCE",
    ])
    .optional(),
  note: z.string().optional(),
  penalty: z.number().nonnegative().optional(),
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

const setCountsSchema = z.object({
  shiftCount: z.number().int().min(0).optional(),
  violationCount: z.number().int().min(0).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
  violationType: z
    .enum([
      "LATE",
      "EARLY",
      "PACKING_ERROR",
      "DAMAGED_GOODS",
      "UNAUTHORIZED_ABSENCE",
    ])
    .optional(),
  shiftType: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).optional(),
  note: z.string().optional(),
});

const setCountsBulkSchema = z.object({
  employeeIds: z.array(z.string().uuid()).min(1),
  shiftCount: z.number().int().min(0).optional(),
  violationCount: z.number().int().min(0).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
  violationType: z
    .enum([
      "LATE",
      "EARLY",
      "PACKING_ERROR",
      "DAMAGED_GOODS",
      "UNAUTHORIZED_ABSENCE",
    ])
    .optional(),
  shiftType: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).optional(),
  note: z.string().optional(),
});

module.exports = {
  createShiftSchema,
  createViolationSchema,
  generatePayrollSchema,
  updateEmployeeSchema,
  setCountsSchema,
  setCountsBulkSchema,
};
