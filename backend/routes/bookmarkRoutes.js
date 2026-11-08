import express from "express";
import { toggleBookmark, getBookmarks } from "../controllers/bookmarkController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:jobId", protect, toggleBookmark);
router.get("/", protect, getBookmarks);

export default router;