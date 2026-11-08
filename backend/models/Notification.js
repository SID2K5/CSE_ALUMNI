import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // 🔥 RECEIVER (WHO GETS NOTIFICATION)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 SENDER (WHO TRIGGERED IT)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔥 TYPE (EXPANDED - SAFE)
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "connection",              // old
        "connection_request",      // 🔥 new
        "connection_accepted",     // 🔥 new
        "system",                  // 🔥 future use
      ],
      default: "system",
    },

    // 🔥 MESSAGE
    message: {
      type: String,
      default: "",
    },

    // 🔗 REDIRECT LINK (e.g. profile/post)
    link: {
      type: String,
      default: "",
    },

    // 🔥 READ STATUS
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔥 WHEN USER READ IT
    readAt: {
      type: Date,
    },

    // 🔥 FLEXIBLE DATA (VERY IMPORTANT)
    meta: {
      type: Object,
      default: {},
      // Example:
      // { postId, connectionId, etc }
    },
  },
  { timestamps: true }
);

/* =====================================================
   🔥 INDEXES (PERFORMANCE BOOST)
===================================================== */

// Fast unread fetch
notificationSchema.index({ user: 1, isRead: 1 });

// Latest notifications
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;