import express from "express";

import {

  // 📊 DASHBOARD
  getStats,

  // 👥 USER MANAGEMENT
  deleteUser,
  getPendingUsers,
  approveUser,
  rejectUser,

  // 📝 POST MANAGEMENT
  deletePost,

  // 🚨 REPORT MANAGEMENT
  getReportedPosts,
  ignoreReport,

  // 👨‍🏫 TEACHER MANAGEMENT
  createTeacher,
  getAllTeachers,
  removeTeacher,

  // 📅 EVENT MANAGEMENT
  getPendingEvents,
  approveEvent,
  rejectEvent,

} from "../controllers/adminController.js";

import {
  getReportMeta,
  generateReport,
} from "../controllers/adminReportController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   🛡️ ADMIN MIDDLEWARE
===================================================== */

const adminOnly = (
  req,
  res,
  next
) => {

  if (
    req.user.role !==
    "admin"
  ) {

    return res
      .status(403)
      .json({
        message:
          "Admin only",
      });

  }

  next();

};

/* =====================================================
   📊 DASHBOARD / ANALYTICS
===================================================== */

// 📊 Dashboard stats
router.get(
  "/stats",
  protect,
  adminOnly,
  getStats
);

/* =====================================================
   📑 CSV REPORTS
===================================================== */

// 🧭 Datasets, columns and filters available for export
router.get(
  "/report/meta",
  protect,
  adminOnly,
  getReportMeta
);

// 📥 Generate a filtered + sorted report (CSV, or JSON preview)
router.get(
  "/report",
  protect,
  adminOnly,
  generateReport
);

/* =====================================================
   👥 USER MANAGEMENT
===================================================== */

// 📋 Get pending users
router.get(
  "/pending-users",
  protect,
  adminOnly,
  getPendingUsers
);

// ✅ Approve user + assign role
router.put(
  "/approve/:id",
  protect,
  adminOnly,
  approveUser
);

// ❌ Reject user
router.delete(
  "/reject/:id",
  protect,
  adminOnly,
  rejectUser
);

// 👤 Delete user
router.delete(
  "/user/:id",
  protect,
  adminOnly,
  deleteUser
);

/* =====================================================
   👨‍🏫 TEACHER MANAGEMENT
===================================================== */

// ➕ Create teacher
router.post(
  "/create-teacher",
  protect,
  adminOnly,
  createTeacher
);

// 📚 Get all teachers
router.get(
  "/teachers",
  protect,
  adminOnly,
  getAllTeachers
);

// ❌ Remove teacher
router.delete(
  "/teacher/:id",
  protect,
  adminOnly,
  removeTeacher
);

/* =====================================================
   📝 POST MANAGEMENT
===================================================== */

// 🗑 Delete post
router.delete(
  "/post/:id",
  protect,
  adminOnly,
  deletePost
);

/* =====================================================
   🚨 REPORT MANAGEMENT
===================================================== */

// 🚨 Get reported posts
router.get(
  "/reported-posts",
  protect,
  adminOnly,
  getReportedPosts
);

// ✅ Ignore report
router.put(
  "/ignore-report/:id",
  protect,
  adminOnly,
  ignoreReport
);

/* =====================================================
   📅 EVENT MANAGEMENT
===================================================== */

// 📋 Get pending events
router.get(
  "/pending-events",
  protect,
  adminOnly,
  getPendingEvents
);

// ✅ Approve event
router.put(
  "/approve-event/:id",
  protect,
  adminOnly,
  approveEvent
);

// ❌ Reject event
router.delete(
  "/reject-event/:id",
  protect,
  adminOnly,
  rejectEvent
);

/* ===================================================== */

export default router;