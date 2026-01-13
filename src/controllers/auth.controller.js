const authService = require("../services/auth.service");
const response = require("../utils/response");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return response.success(res, 201, "Register successful", user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return response.success(res, 201, "Login successful", data);
  } catch (err) {
    next(err);
  }
};
