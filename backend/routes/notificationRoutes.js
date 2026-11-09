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
   ✅ MARK ALL AS READ
   NOTE: must stay ABOVE "/:id" — Express matches in order,
   so a literal route declared after "/:id" would be shadowed
   (PUT /notifications/read-all was hitting markAsRead with
   id="read-all" and could never succeed).
===================================================== */
router.put("/read-all", protect, markAllAsRead);

/* =====================================================
   ✅ MARK SINGLE AS READ
===================================================== */
router.put("/:id", protect, markAsRead);

/* =====================================================
   🗑️ DELETE NOTIFICATION
===================================================== */
router.delete("/:id", protect, deleteNotification);

export default router;