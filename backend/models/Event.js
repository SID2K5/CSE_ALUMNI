import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    /* =====================================================
       📝 BASIC INFO
    ===================================================== */

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    poster: {
      type: String,
      default: "",
    },

    /* =====================================================
       📅 EVENT DURATION
       MULTI-DAY SUPPORT
    ===================================================== */

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================================
       👤 CREATED BY
    ===================================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* =====================================================
       👥 ATTENDEES
    ===================================================== */

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =====================================================
       🔒 EVENT VISIBILITY
       (NO MANUAL APPROVAL NEEDED NOW)
    ===================================================== */

    isApproved: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "approved",
    },

    /* =====================================================
       ⏳ AUTO DELETE SYSTEM
    ===================================================== */

    autoDelete: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       🗑 SOFT DELETE SUPPORT
    ===================================================== */

    deletedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       🧠 FUTURE SCALABILITY
    ===================================================== */

    // 📂 EVENT CATEGORY
    category: {
      type: String,
      default: "General",
    },

    // 📊 ANALYTICS
    views: {
      type: Number,
      default: 0,
    },

    // ⭐ FEATURED EVENT
    featured: {
      type: Boolean,
      default: false,
    },
  },

  /* =====================================================
     ⏰ TIMESTAMPS
  ===================================================== */
  {
    timestamps: true,
  }
);

/* =====================================================
   🚀 INDEXING
===================================================== */

// 🔍 SEARCH INDEX
eventSchema.index({
  title: "text",
  description: "text",
  location: "text",
});

// 📅 FAST DATE QUERIES
eventSchema.index({
  startDate: 1,
});

eventSchema.index({
  endDate: 1,
});

const Event = mongoose.model(
  "Event",
  eventSchema
);

export default Event;