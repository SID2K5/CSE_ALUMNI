import express from "express";
import {
  getNotifications,
  markAsRead,

  // 🔥 NEW IMPORTS
  getUnreadCount,
  markAllAsRead,
  deleteNotification,

} from "../controllers/notificationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   🔔 FETCH NOTIFICATIONS
===================================================== */
router.get("/", protect, getNotifications);

/* =====================================================
   🔴 UNREAD COUNT (FOR 🔔 BADGE)
===================================================== */
router.get("/unread", protect, getUnreadCount);

/* =====================================================
   ✅ MARK SINGLE AS READ
===================================================== */
router.put("/:id", protect, markAsRead);

/* =====================================================
   ✅ MARK ALL AS READ
===================================================== */
router.put("/read-all", protect, markAllAsRead);

/* =====================================================
   🗑️ DELETE NOTIFICATION
===================================================== */
router.delete("/:id", protect, deleteNotification);

export default router;