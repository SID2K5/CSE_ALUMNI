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

// Role gates: resourceManage (admin+teacher), resourceRead (not alumni).
import resourceAccess, {
  resourceRead,
} from "../middleware/resourceAccessMiddleware.js";

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
   📥 GET ALL RESOURCES  (not for alumni)
===================================================== */
router.get(
  "/",
  protect,
  resourceRead,
  getResources
);

/* =====================================================
   👨‍🏫 GET MY RESOURCES  (admin/teacher only — uploaders)
===================================================== */
router.get(
  "/my",
  protect,
  resourceAccess, // upload rights required to have "my" resources
  getMyResources
);

/* =====================================================
   👁️ VIEW RESOURCE  (not for alumni)
===================================================== */
router.put(
  "/view/:id",
  protect,
  resourceRead,
  viewResource
);

/* =====================================================
   ⬇️ DOWNLOAD RESOURCE  (not for alumni)
===================================================== */
router.get(
  "/download/:id",
  protect,
  resourceRead,
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