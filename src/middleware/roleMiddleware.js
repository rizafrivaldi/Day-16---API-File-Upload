module.exports = (...roles) => {
  return (res, req, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak (role tidak diizinkan)" });
    }
    next();
  };
};
