import express from "express";

import {
  sendRequest,
  respondRequest,
  getConnections,
  getPendingRequests,
  getSuggestions,
  getSentRequests,
  getConnectionStatus,
  getMutualConnections,
  cancelRequest,
  getConnectionFilterOptions,
  removeConnection,
} from "../controllers/connectionController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   📤 CONNECTION ACTIONS
===================================================== */

// Existing send request route
router.post("/send", protect, sendRequest);

// 🔥 TeacherProfile compatibility
router.put(
  "/send/:id",
  protect,
  (req, res, next) => {
    req.body.receiverId = req.params.id;
    next();
  },
  sendRequest
);

// Accept / Reject request
router.put("/respond/:id", protect, respondRequest);

// Cancel sent request
router.delete("/cancel/:id", protect, cancelRequest);

// ❌ REMOVE CONNECTION
router.delete("/remove/:id", protect, removeConnection);


/* =====================================================
   📊 CONNECTION DATA
===================================================== */

// 🔥 FILTER OPTIONS
router.get(
  "/filter-options",
  protect,
  getConnectionFilterOptions
);

// 🔥 MAIN CONNECTION ROUTE
// IMPORTANT: frontend currently uses /connections
router.get("/", protect, getConnections);

// 🔥 BACKWARD COMPATIBILITY
router.get("/my", protect, getConnections);

// Incoming requests
router.get("/pending", protect, getPendingRequests);

// Sent requests
router.get("/sent", protect, getSentRequests);

// Suggestions
router.get("/suggestions", protect, getSuggestions);


/* =====================================================
   🔍 ADVANCED
===================================================== */

// Connection status
router.get(
  "/status/:userId",
  protect,
  getConnectionStatus
);

// Mutual connections
router.get(
  "/mutual/:userId",
  protect,
  getMutualConnections
);

export default router;