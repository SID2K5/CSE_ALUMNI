import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getOrCreateConversation,
} from "../controllers/chatController.js";

const router = express.Router();

/* =====================================================
   💬 CONVERSATIONS
===================================================== */

router.get(
  "/conversation/:userId",
  protect,
  getOrCreateConversation
);

export default router;