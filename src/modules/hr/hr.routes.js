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
router.post("/shifts", authenticate, controller.createShift);
router.post("/violations", authenticate, controller.createViolation);
router.post("/payrolls/generate", authenticate, controller.generatePayroll);

module.exports = router;
