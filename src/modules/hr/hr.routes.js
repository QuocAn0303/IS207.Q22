const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const controller = require("./hr.controller");

router.get("/employees", authenticate, controller.listEmployees);
router.patch(
  "/employees/:id",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  controller.updateEmployee,
);
router.post(
  "/shifts",
  authenticate,
  authorize("ADMIN"),
  controller.createShift,
);
router.post(
  "/violations",
  authenticate,
  authorize("ADMIN"),
  controller.createViolation,
);
router.patch(
  "/violations/:id",
  authenticate,
  authorize("ADMIN"),
  controller.updateViolation,
);
// Admin-only: set counts (shifts / violations) for a given employee and month
router.patch(
  "/employees/:id/counts",
  authenticate,
  authorize("ADMIN"),
  controller.setEmployeeCounts,
);
router.patch(
  "/employees/bulk/counts",
  authenticate,
  authorize("ADMIN"),
  controller.setBulkCounts,
);
router.post("/payrolls/generate", authenticate, controller.generatePayroll);

module.exports = router;
