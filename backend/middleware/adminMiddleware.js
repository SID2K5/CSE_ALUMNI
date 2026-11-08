const adminOnly = (req, res, next) => {
  try {
    // 🔍 Check if user exists (set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized. Please login again.",
      });
    }

    // 🔍 Debug log (VERY useful while developing)
    console.log("Admin Middleware Check →", req.user.role);

    // 🔒 Check admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    // ✅ Allow access
    next();

  } catch (error) {
    console.error("Admin Middleware Error:", error.message);

    res.status(500).json({
      message: "Server error in admin middleware",
    });
  }
};

export default adminOnly;