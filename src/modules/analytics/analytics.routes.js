const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth.middleware");
const analyticsService = require("./analytics.service");

router.get("/sales-insights", authenticate, async (req, res, next) => {
  try {
    const out = await analyticsService.salesInsights();
    res.json({ success: true, data: out });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
