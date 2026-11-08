import express from "express";

import protect from "../middleware/authMiddleware.js";

import adminOnly from "../middleware/adminMiddleware.js";

import {
  generateReport,
  getReportFilters,
} from "../controllers/reportController.js";

const router =
  express.Router();

/* =====================================================
   REPORT GENERATION
===================================================== */

router.get(
  "/generate",
  protect,
  adminOnly,
  generateReport
);

/* =====================================================
   FETCH FILTER OPTIONS
===================================================== */

router.get(
  "/filters",
  protect,
  adminOnly,
  getReportFilters
);

export default router;