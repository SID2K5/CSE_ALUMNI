import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    fileUrl: {
      type: String,
      required: true,

      // prevent broken URLs
      validate: {
        validator: function (v) {
          return typeof v === "string" && v.length > 20;
        },
        message: "Invalid file URL",
      },
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    // Resource category. The name `type` is preserved for backward
    // compatibility with existing documents and the current /api/resources?type=
    // filter. Extended from 3 → 5 options so the UI can expose the full
    // set the brief requires.
    type: {
      type: String,
      enum: ["notes", "pyq", "assignment", "study-material", "other"],
      default: "notes",
      index: true,
    },

    // ownership
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // uploader role snapshot
    uploadedByRole: {
      type: String,
      enum: ["admin", "teacher"],
      default: "teacher",
    },

    // moderation
    isApproved: {
      type: Boolean,
      default: true,
    },

    // analytics
    downloads: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    // file metadata
    fileSize: {
      type: Number,
      default: 0,
    },

    fileType: {
      type: String,
      default: "application/pdf",
    },

    // subject/category
    subject: {
      type: String,
      trim: true,
      default: "",
    },

    // searchable tags
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // optional thumbnail / preview
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

// filtering
resourceSchema.index({ semester: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ uploadedBy: 1 });

// advanced discovery
resourceSchema.index({ subject: 1 });
resourceSchema.index({ tags: 1 });

// search optimization
resourceSchema.index({
  title: "text",
  description: "text",
  subject: "text",
  tags: "text",
});

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;