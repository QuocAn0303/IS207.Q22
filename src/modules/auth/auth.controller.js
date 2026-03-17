// src/modules/auth/auth.controller.js
const authService = require('./auth.service');
const { success } = require('../../utils/response');
const { loginSchema, changePasswordSchema } = require('./auth.validation');

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    success(res, result, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    success(res, user);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user.id, data);
    success(res, null, result.message);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile, changePassword };
