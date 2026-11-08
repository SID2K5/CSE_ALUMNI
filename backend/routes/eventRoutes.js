import express from "express";

import {
  createEvent,
  getEvents,
  toggleRSVP,
  getSingleEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   ================= USER ROUTES =================
===================================================== */

// 🚀 Create event
// (Alumni / Teacher / Admin)
router.post(
  "/",
  protect,
  upload.single("poster"),
  createEvent
);

// 📅 Get all events
router.get(
  "/",
  protect,
  getEvents
);

// 🎟 RSVP / Un-RSVP
router.put(
  "/rsvp/:id",
  protect,
  toggleRSVP
);

// 🗑 Delete event
// Admin -> any event
// Alumni/Teacher -> own event
router.delete(
  "/:id",
  protect,
  deleteEvent
);

/* =====================================================
   ================= DYNAMIC ROUTE =================
===================================================== */

// 📄 Get single event
router.get(
  "/:id",
  protect,
  getSingleEvent
);

export default router;