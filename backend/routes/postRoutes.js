import express from "express";

import {
  createPost,
  getFeed,
  toggleLike,
  reactPost,
  addComment,
  addReply,
  deletePost,
  reportPost,
  getReportedPosts,
  getMyPosts,
} from "../controllers/postController.js";

import protect from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =====================================================
   POSTS
===================================================== */

// CREATE POST (MULTIPLE MEDIA SUPPORT)
router.post(
  "/",
  protect,
  upload.array("media", 10),
  createPost
);

// GET FEED
router.get(
  "/",
  protect,
  getFeed
);

/* =====================================================
   LIKE + REACTIONS
===================================================== */

// OLD LIKE SYSTEM 👍
router.put(
  "/like/:id",
  protect,
  toggleLike
);

// REACTION SYSTEM ❤️🔥🎉
router.put(
  "/react/:id",
  protect,
  reactPost
);

/* =====================================================
   COMMENTS
===================================================== */

// ADD COMMENT
router.post(
  "/comment/:id",
  protect,
  addComment
);

// ADD REPLY
router.post(
  "/reply/:postId/:commentId",
  protect,
  addReply
);

/* =====================================================
   DELETE POST 🗑️
===================================================== */

router.delete(
  "/:id",
  protect,
  deletePost
);

/* =====================================================
   REPORT POST 🚨
===================================================== */

router.put(
  "/report/:id",
  protect,
  reportPost
);

/* =====================================================
   GET REPORTED POSTS 🚨
===================================================== */

router.get(
  "/reported/all",
  protect,
  getReportedPosts
);

router.get("/mine", protect, getMyPosts);

export default router;