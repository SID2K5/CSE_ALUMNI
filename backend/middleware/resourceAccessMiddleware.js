/**
 * Two policies for /api/resources:
 *
 *   resourceManage  — upload / delete (admin + teacher only)
 *   resourceRead    — list / view / download (everyone except alumni)
 *
 * `resourceAccess` is kept as the default export (= resourceManage) so
 * the existing route (upload) that imports it does not break.
 */

export const resourceManage = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "teacher")
  ) {
    return next();
  }
  return res.status(403).json({
    message: "Only teachers and admins can manage resources",
  });
};

export const resourceRead = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  // Everyone except alumni can read resources (per policy).
  if (req.user.role === "alumni") {
    return res.status(403).json({
      message: "Resources are not available for alumni accounts",
    });
  }
  return next();
};

// Backward-compatible default export
export default resourceManage;
