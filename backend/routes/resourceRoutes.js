import express from "express";

import {
  uploadResource,
  getResources,
  downloadResource,
  deleteResource,
  getMyResources,
  viewResource,
} from "../controllers/resourceController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

// NEW
import resourceAccess from "../middleware/resourceAccessMiddleware.js";

const router = express.Router();

/* =====================================================
   📚 RESOURCE ROUTES (PRODUCTION READY)
===================================================== */

/* =====================================================
   📤 UPLOAD RESOURCE
   Admin + Teacher
===================================================== */
router.post(
  "/",
  protect,
  resourceAccess,
  upload.single("file"),
  uploadResource
);

/* =====================================================
   📥 GET ALL RESOURCES
===================================================== */
router.get(
  "/",
  protect,
  getResources
);

/* =====================================================
   👨‍🏫 GET MY RESOURCES
===================================================== */
router.get(
  "/my",
  protect,
  getMyResources
);

/* =====================================================
   👁️ VIEW RESOURCE
===================================================== */
router.put(
  "/view/:id",
  protect,
  viewResource
);

/* =====================================================
   ⬇️ DOWNLOAD RESOURCE
===================================================== */
router.get(
  "/download/:id",
  downloadResource
);

/* =====================================================
   🗑️ DELETE RESOURCE
===================================================== */
router.delete(
  "/:id",
  protect,
  deleteResource
);

export default router;