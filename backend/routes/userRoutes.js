import express from "express";

import {
  getMyProfile,
  getUserById,
  updateProfile,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ======================================================
// 🔥 GET CURRENT USER PROFILE
// ======================================================

/**
 * @route   GET /api/users/me
 * @desc    Get logged-in user profile
 */
router.get("/me", protect, getMyProfile);

// ======================================================
// 🔥 UPDATE PROFILE
// ======================================================

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile (MULTIPLE FILE SUPPORT)
 */
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },      // Profile picture
    { name: "coverPic", maxCount: 1 },   // Cover image
    { name: "resume", maxCount: 1 },     // Resume upload
  ]),
  updateProfile
);

// ======================================================
// 🔥 GET USER BY ID (DYNAMIC PROFILE)
// IMPORTANT: KEEP THIS LAST
// ======================================================

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 */
router.get("/:id", protect, getUserById);

export default router;