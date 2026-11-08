import express from "express";
import {
  getAlumni,
  getCompanyStats,
  getYearStats,
  getAlumniByCompany,
} from "../controllers/alumniController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔍 Get alumni (filters: name, company, year, location, domain, skills)
router.get("/", protect, getAlumni);

// 📊 Top companies by alumni count
router.get("/stats", protect, getCompanyStats);

// 📈 Graduation-year distribution
router.get("/year-stats", protect, getYearStats);

// 🏢 Company-wise alumni
router.get("/company/:company", protect, getAlumniByCompany);

export default router;