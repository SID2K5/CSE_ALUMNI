import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* =====================================================
       🔹 BASIC INFO
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* =====================================================
       🆕 REGISTRATION DETAILS
    ===================================================== */

    rollNumber: {
      type: String,
      default: "",
      trim: true,
    },

    passOutYear: {
      type: Number,
    },

    /* =====================================================
       🖼️ IMAGES
    ===================================================== */

    profilePic: {
      type: String,
      default: "",
    },

    coverPic: {
      type: String,
      default: "",
    },

    /* =====================================================
       🧠 PROFILE INFO
    ===================================================== */

    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    skills: {
      type: [String],
      default: [],
    },

    resume: {
      type: String,
      default: "",
    },

    portfolioLinks: [
      {
        label: {
          type: String,
          default: "",
        },

        url: {
          type: String,
          default: "",
        },
      },
    ],

    /* =====================================================
       🔐 ROLE SYSTEM
    ===================================================== */

    role: {
      type: String,
      enum: [
        "student",
        "alumni",
        "admin",
        "teacher",
      ],
      default: "student",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBadge: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       👨‍🏫 / 🎓 DEPARTMENT
    ===================================================== */

    department: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    teacherVerified: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       🔗 CONNECTIONS
    ===================================================== */

    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    connectionRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =====================================================
       🎓 EDUCATION
    ===================================================== */

    education: {
      type: String,
      default: "",
    },

    /* =====================================================
       💼 WORK
    ===================================================== */

    company: {
      type: String,
      default: "",
      trim: true,
    },

    companyNormalized: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    position: {
      type: String,
      default: "",
    },

    graduationYear: {
      type: Number,
    },

    batch: {
      type: Number,
    },

    location: {
      type: String,
      default: "",
    },

    isAlumni: {
      type: Boolean,
      default: false,
    },

    domain: {
      type: String,
      default: "",
    },

    currentStatus: {
      type: String,
      enum: [
        "student",
        "working",
        "higher-studies",
        "teaching",
      ],
      default: "student",
    },

    /* =====================================================
       🌐 SOCIAL LINKS
    ===================================================== */

    socialLinks: {
      github: {
        type: String,
        default: "",
      },

      linkedin: {
        type: String,
        default: "",
      },

      portfolio: {
        type: String,
        default: "",
      },
    },

    /* =====================================================
       🔖 BOOKMARKS
    ===================================================== */

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],

    jobBookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    /* =====================================================
       🤖 JOB ACTIVITY
    ===================================================== */

    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    viewedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    /* =====================================================
       📊 PROFILE COMPLETION
    ===================================================== */

    profileCompletion: {
      type: Number,
      default: 0,
    },

    /* =====================================================
       🕒 ACTIVITY
    ===================================================== */

    lastActive: {
      type: Date,
      default: Date.now,
    },

    /* =====================================================
       🔥 CHAT / PRESENCE
    ===================================================== */

    isOnline: {
      type: Boolean,
      default: false,
    },

    // ✅ FIXED LAST SEEN
    // NEVER USE Date.now HERE
    // OTHERWISE EVERY USER GETS CURRENT TIME
    lastSeen: {
      type: Date,
      default: null,
    },

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    mutedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    pinnedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* =====================================================
       🔔 NOTIFICATIONS
    ===================================================== */

    notifications: [
      {
        title: String,

        message: String,

        type: {
          type: String,
          default: "general",
        },

        read: {
          type: Boolean,
          default: false,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    notificationSettings: {
      messages: {
        type: Boolean,
        default: true,
      },

      connections: {
        type: Boolean,
        default: true,
      },

      jobs: {
        type: Boolean,
        default: true,
      },

      events: {
        type: Boolean,
        default: true,
      },
    },

    /* =====================================================
       🛡️ ADMIN MODERATION
    ===================================================== */

    banned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: "",
    },

    /* =====================================================
       ⚙️ USER SETTINGS
    ===================================================== */

    darkMode: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* =====================================================
   🔥 AUTO PROFILE COMPLETION
===================================================== */

userSchema.pre("save", function (next) {

  const fields = [

    this.name,
    this.bio,
    this.education,
    this.company,
    this.skills.length > 0,
    this.profilePic,
    this.resume,
    this.location,
    this.graduationYear,
    this.portfolioLinks?.length > 0,

    this.department,
    this.specialization,
    this.designation,

    this.rollNumber,
    this.passOutYear,
  ];

  const filled =
    fields.filter(Boolean).length;

  this.profileCompletion =
    Math.round(
      (filled / fields.length) * 100
    );

  /* =====================================================
     🔥 NORMALIZE COMPANY
  ===================================================== */

  if (this.company) {

    this.companyNormalized =
      this.company
        .toLowerCase()
        .trim();
  }

  /* =====================================================
     🔥 SYNC BATCH
  ===================================================== */

  if (this.graduationYear) {

    this.batch =
      this.graduationYear;
  }

  /* =====================================================
     🔥 AUTO ALUMNI
  ===================================================== */

  if (
    this.role === "alumni"
  ) {

    this.isAlumni = true;
  }

  next();
});

/* =====================================================
   🔥 INDEXES
===================================================== */

userSchema.index({
  companyNormalized: 1,
});

userSchema.index({
  graduationYear: 1,
});

userSchema.index({
  isAlumni: 1,
});

userSchema.index({
  role: 1,
});

userSchema.index({
  department: 1,
});

userSchema.index({
  rollNumber: 1,
});

userSchema.index({
  isOnline: 1,
});

userSchema.index({
  location: 1,
});

userSchema.index({
  skills: 1,
});

const User = mongoose.model(
  "User",
  userSchema
);

export default User;