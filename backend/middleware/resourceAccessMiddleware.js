const resourceAccess = (req, res, next) => {
  if (
    req.user.role === "admin" ||
    req.user.role === "teacher"
  ) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied",
    });
  }
};

export default resourceAccess;