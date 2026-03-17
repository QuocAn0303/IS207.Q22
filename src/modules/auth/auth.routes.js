// src/modules/auth/auth.routes.js
const router = require('express').Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
