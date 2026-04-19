const prisma = require("../../config/prisma");
const { calculatePayroll } = require("./payroll.calc");

// Payroll rules implementation
const generatePayrollForMonth = async (month, year) => {
  // get all employees
  const employees = await prisma.employee.findMany({
    include: { user: true, shifts: true, violations: true },
  });

  const createdPayrolls = [];

  for (const emp of employees) {
    // compute shift count for the month
    const shiftCount = await prisma.shift.count({
      where: {
        employeeId: emp.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    // compute violations in that month
    const violations = await prisma.violation.findMany({
      where: {
        employeeId: emp.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    // determine per-shift pay (prefer configured value)
    const shiftMoneyValue = emp.shiftMoney
      ? Number(emp.shiftMoney)
      : Number(emp.baseSalary) * 0.05;

    // use shared pure calculation helper
    const calc = calculatePayroll({
      baseSalary: emp.baseSalary,
      shiftCount,
      shiftMoney: shiftMoneyValue,
      violations,
    });

    let finalSalary = 0;
    if (calc.suspended) {
      finalSalary = 0;
      await prisma.employee.update({
        where: { id: emp.id },
        data: { isActive: false },
      });
    } else {
      finalSalary = calc.finalSalary;
    }

    // create/update payroll record (store shiftMoney used)
    const existing = await prisma.payroll.findFirst({
      where: { employeeId: emp.id, month, year },
    });
    let rec;
    if (existing) {
      rec = await prisma.payroll.update({
        where: { id: existing.id },
        data: {
          baseSalary: emp.baseSalary,
          shiftMoney: shiftMoneyValue,
          shiftCount,
          attendanceCoefficient: calc.attendanceCoefficient,
          penalties: calc.penalties,
          finalSalary,
        },
      });
    } else {
      rec = await prisma.payroll.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          baseSalary: emp.baseSalary,
          shiftMoney: shiftMoneyValue,
          shiftCount,
          attendanceCoefficient: calc.attendanceCoefficient,
          penalties: calc.penalties,
          finalSalary,
        },
      });
    }

    createdPayrolls.push(rec);
  }

  return createdPayrolls;
};

const listEmployeesWithPreview = async () => {
  const emps = await prisma.employee.findMany({ include: { user: true } });
  const res = [];
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  for (const emp of emps) {
    const shiftCount = await prisma.shift.count({
      where: {
        employeeId: emp.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });
    const violations = await prisma.violation.findMany({
      where: {
        employeeId: emp.id,
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    // calculate preview salary using shared helper
    const shiftMoneyValue = emp.shiftMoney
      ? Number(emp.shiftMoney)
      : Number(emp.baseSalary) * 0.05;
    const calc = calculatePayroll({
      baseSalary: emp.baseSalary,
      shiftCount,
      shiftMoney: shiftMoneyValue,
      violations,
    });

    res.push({
      employee: emp,
      shiftCount,
      violations,
      preview: {
        baseSalary: emp.baseSalary,
        shiftMoney: shiftMoneyValue,
        attendanceCoefficient: calc.attendanceCoefficient,
        penalties: calc.penalties,
        finalSalary: calc.finalSalary,
      },
    });
  }

  return res;
};

module.exports = { generatePayrollForMonth, listEmployeesWithPreview };
