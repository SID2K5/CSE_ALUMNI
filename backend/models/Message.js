import mongoose from "mongoose";

/* =====================================================
   😀 REACTION SCHEMA
===================================================== */

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    emoji: {
      type: String,
      default: "👍",
    },
  },
  { _id: false }
);

/* =====================================================
   💬 MESSAGE SCHEMA
===================================================== */

const messageSchema = new mongoose.Schema(
  {
    /* =====================================================
       👤 USERS
    ===================================================== */

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =====================================================
       💬 TEXT CONTENT
    ===================================================== */

    text: {
      type: String,
      trim: true,
      default: "",
    },

    /* =====================================================
       📎 MESSAGE TYPE
    ===================================================== */

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "file",
        "pdf",
        "voice",
      ],
      default: "text",
    },

    /* =====================================================
       📂 FILE SUPPORT
    ===================================================== */

    // 🔥 OLD FRONTEND COMPATIBILITY
    file: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    // 🔥 NEW SYSTEM
    fileUrl: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    fileMimeType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    /* =====================================================
       👀 MESSAGE STATUS
    ===================================================== */

    read: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    seenAt: {
      type: Date,
    },

    /* =====================================================
       ✏️ EDIT / DELETE
    ===================================================== */

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       😀 REACTIONS
    ===================================================== */

    reactions: [reactionSchema],

    /* =====================================================
       📌 EXTRA FEATURES
    ===================================================== */

    pinned: {
      type: Boolean,
      default: false,
    },

    forwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   🔥 AUTO FILE TYPE DETECTION
===================================================== */

messageSchema.pre("save", function (next) {

  /* =====================================================
     🔥 SYNC OLD + NEW FILE FIELDS
  ===================================================== */

  if (this.file && !this.fileUrl) {
    this.fileUrl = this.file;
  }

  if (this.fileUrl && !this.file) {
    this.file = this.fileUrl;
  }

  if (this.fileType && !this.fileMimeType) {
    this.fileMimeType = this.fileType;
  }

  if (this.fileMimeType && !this.fileType) {
    this.fileType = this.fileMimeType;
  }

  /* =====================================================
     🔥 AUTO DETECT TYPE
  ===================================================== */

  if (
    this.fileMimeType?.startsWith("image")
  ) {
    this.type = "image";
  }

  else if (
    this.fileMimeType ===
    "application/pdf"
  ) {
    this.type = "pdf";
  }

  else if (this.fileUrl) {
    this.type = "file";
  }

  next();
});

/* =====================================================
   🔥 PERFORMANCE INDEXES
===================================================== */

// 🔥 CHAT LOOKUP
messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: -1,
});

// 🔥 UNREAD COUNT
messageSchema.index({
  receiver: 1,
  read: 1,
});

// 🔥 PAGINATION
messageSchema.index({
  createdAt: -1,
});

// 🔥 FILE SEARCH
messageSchema.index({
  type: 1,
});

// 🔥 DELETED FILTER
messageSchema.index({
  deleted: 1,
});

/* =====================================================
   🚀 MODEL EXPORT
===================================================== */

const Message = mongoose.model(
  "Message",
  messageSchema
);

export default Message;