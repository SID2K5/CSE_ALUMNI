import mongoose from "mongoose";

/* =====================================================
   REPLY SCHEMA
===================================================== */

const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  text: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* =====================================================
   COMMENT SCHEMA
===================================================== */

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  text: {
    type: String,
    trim: true,
  },

  replies: [replySchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* =====================================================
   POST SCHEMA
===================================================== */

const postSchema = new mongoose.Schema(
  {
    /* =====================================================
       USER
    ===================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =====================================================
       CONTENT
    ===================================================== */

    content: {
  type: String,
  default: "",
  trim: true,
},

    /* =====================================================
       SINGLE IMAGE (OLD FEATURE)
    ===================================================== */

    image: {
      type: String,
      default: "",
    },

    /* =====================================================
       MULTIPLE MEDIA
    ===================================================== */

    media: [
      {
        type: String,
      },
    ],

    /* =====================================================
       CODE SNIPPET
    ===================================================== */

    codeSnippet: {
      type: String,
      default: "",
    },

    /* =====================================================
       OLD LIKE SYSTEM
    ===================================================== */

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =====================================================
       REACTION SYSTEM ❤️🔥🎉
    ===================================================== */

    reactions: {
      heart: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      fire: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      celebrate: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    /* =====================================================
       HASHTAGS
    ===================================================== */

    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],

    /* =====================================================
       COMMENTS
    ===================================================== */

    comments: [commentSchema],

    /* =====================================================
       REPORT SYSTEM 🚨
    ===================================================== */

    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =====================================================
       OPTIONAL MODERATION FLAG
    ===================================================== */

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       OPTIONAL PIN FEATURE
    ===================================================== */

    isPinned: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       POST TYPE
    ===================================================== */

    postType: {
      type: String,
      enum: [
        "text",
        "image",
        "media",
        "code",
      ],
      default: "text",
    },
  },

  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXING (PERFORMANCE)
===================================================== */

postSchema.index({
  createdAt: -1,
});

postSchema.index({
  hashtags: 1,
});

postSchema.index({
  user: 1,
});

/* =====================================================
   MODEL
===================================================== */

const Post = mongoose.model(
  "Post",
  postSchema
);

export default Post;