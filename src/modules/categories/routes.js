<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const categoryService = require('./category.service');
const authMiddleware = require('../../middleware/auth.middleware');
const response = require('../../utils/response');

// GET: Lấy danh sách danh mục (Tất cả nhân viên đều xem được)
router.get('/', authMiddleware.verifyToken, async (req, res, next) => {
=======
const express = require("express");
const router = express.Router();
const categoryService = require("./category.service");
const authMiddleware = require("../../middleware/auth.middleware");
const response = require("../../utils/response");

// GET: Lấy danh sách danh mục (Tất cả nhân viên đều xem được)
router.get("/", authMiddleware.verifyToken, async (req, res, next) => {
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
  try {
    const categories = await categoryService.getAll();
    res.json(response.success(categories, "Lấy danh sách danh mục thành công"));
  } catch (error) {
    next(error);
  }
});

// POST: Tạo danh mục mới (Chỉ ADMIN hoặc MANAGER)
<<<<<<< HEAD
router.post('/', authMiddleware.restrictTo('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const newCategory = await categoryService.create(req.body);
    res.status(201).json(response.success(newCategory, "Tạo danh mục thành công"));
  } catch (error) {
    next(error);
  }
});

// PUT: Cập nhật danh mục
router.put('/:id', authMiddleware.restrictTo('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const updated = await categoryService.update(req.params.id, req.body);
    res.json(response.success(updated, "Cập nhật danh mục thành công"));
  } catch (error) {
    next(error);
  }
});

// DELETE: Xóa danh mục (Thường chỉ dành cho ADMIN)
router.delete('/:id', authMiddleware.restrictTo('ADMIN'), async (req, res, next) => {
  try {
    await categoryService.remove(req.params.id);
    res.json(response.success(null, "Xóa danh mục thành công"));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
=======
router.post(
  "/",
  authMiddleware.restrictTo("ADMIN", "MANAGER"),
  async (req, res, next) => {
    try {
      const newCategory = await categoryService.create(req.body);
      res
        .status(201)
        .json(response.success(newCategory, "Tạo danh mục thành công"));
    } catch (error) {
      next(error);
    }
  },
);

// PUT: Cập nhật danh mục
router.put(
  "/:id",
  authMiddleware.restrictTo("ADMIN", "MANAGER"),
  async (req, res, next) => {
    try {
      const updated = await categoryService.update(req.params.id, req.body);
      res.json(response.success(updated, "Cập nhật danh mục thành công"));
    } catch (error) {
      next(error);
    }
  },
);

// DELETE: Xóa danh mục (Thường chỉ dành cho ADMIN)
router.delete(
  "/:id",
  authMiddleware.restrictTo("ADMIN"),
  async (req, res, next) => {
    try {
      await categoryService.remove(req.params.id);
      res.json(response.success(null, "Xóa danh mục thành công"));
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
>>>>>>> 56942bc300cd9f14eafbd46f194b40d1720fcb84
