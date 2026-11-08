import express from "express";
import {
  getAlumni,
  getCompanyStats,
  getAlumniByCompany,
} from "../controllers/alumniController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔍 Get all alumni (filters: company, year, location)
router.get("/", protect, getAlumni);

// 📊 Top companies stats
router.get("/stats", protect, getCompanyStats);

// 🏢 Company-wise alumni
router.get("/company/:company", protect, getAlumniByCompany);

export default router;