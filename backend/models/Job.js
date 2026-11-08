import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Job type. Extended from 2 → 4 options so the UI can filter the
    // full set the brief requires. Existing docs keep their current value.
    type: {
      type: String,
      enum: ["Full-time", "Internship", "Part-time", "Contract"],
      default: "Internship",
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    applyLink: {
      type: String,
      required: true,
    },

    // 🔥 NEW: TAGS (FOR AI RECOMMENDATION)
    tags: {
      type: [String],
      default: [],
    },

    // 💰 OPTIONAL: SALARY
    salary: {
      type: String,
      default: "",
    },

    // 🎯 EXPERIENCE LEVEL
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      default: "Fresher",
    },

    // 📊 ANALYTICS (FUTURE USE)
    views: {
      type: Number,
      default: 0,
    },

    // ⏳ EXPIRY (OPTIONAL FUTURE CONTROL)
    expiresAt: {
      type: Date,
    },

    // 🔐 STATUS
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 👤 POSTED BY
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 📨 APPLICANTS
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// 🔥 INDEXING (PERFORMANCE BOOST)
jobSchema.index({ title: "text", company: "text", location: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;