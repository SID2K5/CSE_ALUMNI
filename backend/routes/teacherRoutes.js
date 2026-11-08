import express from "express";
import {
  getTeachers,
  getTeacherProfile,
} from "../controllers/teacherController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all teachers
router.get("/", protect, getTeachers);

// Get single teacher profile
router.get("/:id", protect, getTeacherProfile);

export default router;