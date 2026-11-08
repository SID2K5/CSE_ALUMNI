import Post from "../models/Post.js";
import { getIO } from "../socket.js";


// Get logged-in user's posts
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
  user: req.user._id,
  isDeleted: false,
})
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* =====================================================
   POPULATE CONFIG
===================================================== */

const populatePost = (query) => {

  return query
    .populate(
      "user",
      "name profilePic role"
    )
    .populate(
      "comments.user",
      "name profilePic"
    )
    .populate(
      "comments.replies.user",
      "name profilePic"
    );

};

/* =====================================================
   CREATE POST
===================================================== */

export const createPost = async (
  req,
  res
) => {

  try {

    console.log(
      "FILES:",
      req.files
    );

    console.log(
      "BODY:",
      req.body
    );

    const {
      content,
      codeSnippet,
    } = req.body;

    /* =====================================================
       MEDIA
    ===================================================== */

    let media = [];

    if (
      req.files &&
      req.files.length > 0
    ) {

      media = req.files.map(
        (file) => file.path
      );

    }

    /* =====================================================
       HASHTAGS SAFE PARSE
    ===================================================== */

    let hashtags = [];

    try {

      if (
        req.body.hashtags
      ) {

        hashtags =
          JSON.parse(
            req.body.hashtags
          );

      }

    } catch {

      hashtags = [];

    }

    /* =====================================================
       POST TYPE
    ===================================================== */

    let postType = "text";

    if (
      codeSnippet &&
      codeSnippet.trim() !== ""
    ) {

      postType = "code";

    } else if (
      media.length > 0
    ) {

      postType = "media";

    }

    /* =====================================================
       CREATE POST
    ===================================================== */

    const post =
      await Post.create({

        user: req.user._id,

        content:
          content || "",

        codeSnippet:
          codeSnippet || "",

        image:
          media[0] || "",

        media,

        hashtags,

        likes: [],

        comments: [],

        reactions: {
          heart: [],
          fire: [],
          celebrate: [],
        },

        reports: [],

        postType,

      });

    /* =====================================================
       POPULATE
    ===================================================== */

    const populatedPost =
      await Post.findById(
        post._id
      )

        .populate(
          "user",
          "name profilePic role"
        )

        .populate(
          "comments.user",
          "name profilePic"
        )

        .populate(
          "comments.replies.user",
          "name profilePic"
        );

    /* =====================================================
       SOCKET
    ===================================================== */

    getIO().emit(
      "newPost",
      populatedPost
    );

    res.status(201).json(
      populatedPost
    );

  } catch (error) {

    console.log(
      "CREATE POST ERROR:",
      error
    );

    res.status(500).json({

      message:
        error.message,

      stack:
        process.env.NODE_ENV ===
        "development"
          ? error.stack
          : null,

    });

  }

};

/* =====================================================
   GET FEED
===================================================== */

export const getFeed = async (
  req,
  res
) => {

  try {

    const pageSize = 5;

    const page =
      Number(req.query.page) || 1;

    const hashtag =
      req.query.hashtag || "";

    let query = {
      isDeleted: false,
    };

    // HASHTAG FILTER

    if (hashtag) {

      query.hashtags = {
        $in: [hashtag],
      };

    }

    const count =
      await Post.countDocuments(
        query
      );

    const posts =
      await populatePost(

        Post.find(query)

          .sort({
            isPinned: -1,
            createdAt: -1,
          })

          .limit(pageSize)

          .skip(
            pageSize *
              (page - 1)
          )

      );

    res.json({
      posts,
      page,
      pages: Math.ceil(
        count / pageSize
      ),
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   LIKE SYSTEM
===================================================== */

export const toggleLike = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    const alreadyLiked =
      post.likes.includes(
        req.user._id
      );

    if (alreadyLiked) {

      post.likes =
        post.likes.filter(
          (id) =>
            id.toString() !==
            req.user._id.toString()
        );

    } else {

      post.likes.push(
        req.user._id
      );

    }

    await post.save();

    const updatedPost =
      await populatePost(
        Post.findById(
          post._id
        )
      );

    getIO().emit(
      "postUpdated",
      updatedPost
    );

    res.json(updatedPost);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   REACTION SYSTEM ❤️🔥🎉
===================================================== */

export const reactPost = async (
  req,
  res
) => {

  try {

    const { type } = req.body;

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    if (
      !post.reactions[type]
    ) {

      return res
        .status(400)
        .json({
          message:
            "Invalid reaction type",
        });

    }

    // REMOVE USER FROM ALL REACTIONS

    Object.keys(
      post.reactions
    ).forEach(
      (reaction) => {

        post.reactions[
          reaction
        ] =
          post.reactions[
            reaction
          ].filter(
            (id) =>
              id.toString() !==
              req.user._id.toString()
          );

      }
    );

    // TOGGLE CURRENT

    const alreadyReacted =
      post.reactions[type].includes(
        req.user._id
      );

    if (!alreadyReacted) {

      post.reactions[
        type
      ].push(
        req.user._id
      );

    }

    await post.save();

    const updatedPost =
      await populatePost(
        Post.findById(
          post._id
        )
      );

    getIO().emit(
      "postUpdated",
      updatedPost
    );

    res.json(updatedPost);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   REPORT POST 🚨
===================================================== */

export const reportPost = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    const alreadyReported =
      post.reports.includes(
        req.user._id
      );

    if (
      !alreadyReported
    ) {

      post.reports.push(
        req.user._id
      );

      await post.save();

    }

    res.json({
      message:
        "Post reported successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   GET REPORTED POSTS 🚨
===================================================== */

export const getReportedPosts =
  async (req, res) => {

    try {

      const posts =
        await populatePost(

          Post.find({
            reports: {
              $exists: true,
              $not: {
                $size: 0,
              },
            },
          }).sort({
            createdAt: -1,
          })

        );

      res.json(posts);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }

  };

/* =====================================================
   DELETE POST 🗑️
===================================================== */

export const deletePost = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    const isOwner =
      post.user.toString() ===
      req.user._id.toString();

    const isAdmin =
      req.user.role ===
      "admin";

    if (
      !isOwner &&
      !isAdmin
    ) {

      return res
        .status(403)
        .json({
          message:
            "Unauthorized",
        });

    }

    // SOFT DELETE

    post.isDeleted = true;

    await post.save();

    getIO().emit(
      "postDeleted",
      {
        postId:
          req.params.id,
      }
    );

    res.json({
      message:
        "Post deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   ADD COMMENT
===================================================== */

export const addComment = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    post.comments.push({

      user: req.user._id,

      text: req.body.text,

      replies: [],

      createdAt:
        new Date(),

    });

    await post.save();

    const updatedPost =
      await populatePost(
        Post.findById(
          post._id
        )
      );

    getIO().emit(
      "postUpdated",
      updatedPost
    );

    res.json(updatedPost);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

/* =====================================================
   ADD REPLY
===================================================== */

export const addReply = async (
  req,
  res
) => {

  try {

    const {
      postId,
      commentId,
    } = req.params;

    const post =
      await Post.findById(
        postId
      );

    if (!post) {

      return res
        .status(404)
        .json({
          message:
            "Post not found",
        });

    }

    const comment =
      post.comments.id(
        commentId
      );

    if (!comment) {

      return res
        .status(404)
        .json({
          message:
            "Comment not found",
        });

    }

    comment.replies.push({

      user: req.user._id,

      text: req.body.text,

      createdAt:
        new Date(),

    });

    await post.save();

    const updatedPost =
      await populatePost(
        Post.findById(
          post._id
        )
      );

    getIO().emit(
      "postUpdated",
      updatedPost
    );

    res.json(updatedPost);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};