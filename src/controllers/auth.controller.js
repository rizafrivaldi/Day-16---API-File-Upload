const authService = require("../services/auth.service");
const { success } = require("../utils/response");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return success(res, 201, "Register success", user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return success(res, 200, "Login success", data);
  } catch (err) {
    next(err);
  }
};
