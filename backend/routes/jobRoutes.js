import express from "express";

import {
  createJob,
  getJobs,
  applyJob,
  getPendingJobs,
  approveJob,
  rejectJob,
  getRecommendedJobs,
  trackJobView,
  deleteJob, // 🔥 NEW
} from "../controllers/jobController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

/* =====================================================
   🔹 PUBLIC (AUTH REQUIRED)
===================================================== */

// 📌 Get approved jobs (students + alumni)
router.get(
  "/",
  protect,
  (req, res, next) => {
    console.log("📥 GET /jobs (approved jobs)");
    next();
  },
  getJobs
);

// 📌 🤖 AI Recommended Jobs
router.get(
  "/recommended",
  protect,
  (req, res, next) => {
    console.log("🤖 GET /jobs/recommended");
    next();
  },
  getRecommendedJobs
);

// 📌 Apply to job (students)
router.put(
  "/apply/:id",
  protect,
  (req, res, next) => {
    console.log("📥 APPLY job:", req.params.id);
    next();
  },
  applyJob
);

// 📌 📊 Track job view
router.put(
  "/view/:id",
  protect,
  (req, res, next) => {
    console.log("👁️ VIEW job:", req.params.id);
    next();
  },
  trackJobView
);

/* =====================================================
   🔹 ALUMNI / OWNER
===================================================== */

// 📌 Create job (goes to pending)
router.post(
  "/",
  protect,
  (req, res, next) => {
    console.log("📤 CREATE job by user:", req.user?._id);
    next();
  },
  createJob
);

// 📌 Delete own job OR admin delete
router.delete(
  "/:id",
  protect,
  (req, res, next) => {
    console.log("🗑️ DELETE job:", req.params.id);
    next();
  },
  deleteJob
);

/* =====================================================
   🔹 ADMIN ONLY
===================================================== */

// 📌 Get pending jobs
router.get(
  "/pending",
  protect,
  adminOnly,
  (req, res, next) => {
    console.log("🛡️ ADMIN fetching pending jobs");
    next();
  },
  getPendingJobs
);

// 📌 Approve job
router.put(
  "/approve/:id",
  protect,
  adminOnly,
  (req, res, next) => {
    console.log("✅ ADMIN approving job:", req.params.id);
    next();
  },
  approveJob
);

// 📌 Reject job
router.put(
  "/reject/:id",
  protect,
  adminOnly,
  (req, res, next) => {
    console.log("❌ ADMIN rejecting job:", req.params.id);
    next();
  },
  rejectJob
);

export default router;