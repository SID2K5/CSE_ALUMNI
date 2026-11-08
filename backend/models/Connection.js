import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // 🔥 NEW: TRACK TIMINGS (for UI + analytics)
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


// 🔥 PREVENT DUPLICATE REQUESTS (IMPORTANT)
connectionSchema.index(
  { sender: 1, receiver: 1 },
  { unique: true }
);


// 🔥 FAST LOOKUP INDEXES (PERFORMANCE 🚀)
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ sender: 1, status: 1 });


// 🔥 AUTO HANDLE ACCEPT TIMESTAMP
connectionSchema.pre("save", function (next) {
  if (this.status === "accepted" && !this.acceptedAt) {
    this.acceptedAt = new Date();
  }
  next();
});

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;