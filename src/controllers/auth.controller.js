const authService = require("../services/auth.service");
const { success, error } = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return success(res, 201, "Register successful", user);
  } catch (err) {
    return error(res, err.status, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    return success(res, 201, "Login successful", data);
  } catch (err) {
    return error(res, err.status, err.mmessage);
  }
};
