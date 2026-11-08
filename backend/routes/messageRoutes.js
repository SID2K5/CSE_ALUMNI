import express from "express";

import protect from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import {

  // 🔥 CORE
  sendMessage,
  getMessages,
  getChats,
  markAsRead,

  // 🔥 MESSAGE ACTIONS
  editMessage,
  deleteMessage,
  reactToMessage,

  // 🔥 USER ACTIONS
  blockUser,

} from "../controllers/messageController.js";

const router = express.Router();

/* =====================================================
   📋 CHAT LIST
   RETURNS:
   ✔ Last message
   ✔ Unread count
   ✔ User details
===================================================== */
router.get(
  "/",
  protect,
  getChats
);

/* =====================================================
   📩 SEND MESSAGE
   SUPPORTS:
   ✔ TEXT
   ✔ IMAGE
   ✔ PDF
   ✔ FILES
   ✔ RESUMES
===================================================== */
router.post(
  "/send",
  protect,
  upload.single("file"),
  sendMessage
);

/* =====================================================
   📜 GET CONVERSATION
   SUPPORTS:
   ✔ PAGINATION
   ✔ FILES
   ✔ REALTIME
===================================================== */
router.get(
  "/:userId",
  protect,
  getMessages
);

/* =====================================================
   👀 MARK AS READ
===================================================== */
router.put(
  "/read/:userId",
  protect,
  markAsRead
);

/* =====================================================
   ✏️ EDIT MESSAGE
===================================================== */
router.put(
  "/edit/:id",
  protect,
  editMessage
);

/* =====================================================
   🗑️ DELETE / UNSEND
===================================================== */
router.put(
  "/delete/:id",
  protect,
  deleteMessage
);

/* =====================================================
   😀 REACT TO MESSAGE
===================================================== */
router.put(
  "/react/:id",
  protect,
  reactToMessage
);

/* =====================================================
   🚫 BLOCK USER
===================================================== */
router.put(
  "/block/:userId",
  protect,
  blockUser
);

/* =====================================================
   🚀 FUTURE ROUTES
   (VOICE / CALLS / PINS ETC.)
===================================================== */

// router.post("/voice", protect, upload.single("voice"), sendVoice);

// router.put("/pin/:id", protect, pinMessage);

// router.post("/call", protect, createCall);

export default router;