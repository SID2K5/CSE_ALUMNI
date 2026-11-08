import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";

import connectDB from "./config/db.js";

import { initSocket } from "./socket.js";

/* =====================================================
   🧹 EVENT CLEANUP
===================================================== */

import {
  cleanupExpiredEvents,
} from "./controllers/eventController.js";

/* =====================================================
   🌐 ROUTES
===================================================== */

import alumniRoutes from "./routes/alumniRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

/* =====================================================
   📑 REPORT ROUTES
===================================================== */

import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

const server =
  http.createServer(app);

/* =====================================================
   🔌 SOCKET INIT
===================================================== */

const io =
  initSocket(server);

/* =====================================================
   🌍 GLOBAL SOCKET ACCESS
===================================================== */

app.set("io", io);

/* =====================================================
   🗄️ DATABASE
===================================================== */

connectDB();

/* =====================================================
   🔧 CORE MIDDLEWARE
===================================================== */

// 🔥 BODY PARSER

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

/* =====================================================
   🌍 CORS
===================================================== */

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {

      // 🔥 POSTMAN / MOBILE

      if (!origin) {

        return callback(
          null,
          true
        );

      }

      // 🔥 LOCALHOST

      if (

        origin.startsWith(
          "http://localhost"
        ) ||

        origin.startsWith(
          "http://127.0.0.1"
        )

      ) {

        return callback(
          null,
          true
        );

      }

      // 🔥 PRODUCTION DOMAIN
      // if (
      //   origin ===
      //   "https://yourdomain.com"
      // ) {
      //   return callback(null, true);
      // }

      return callback(
        null,
        true
      );

    },

    credentials: true,
  })
);

// 🔥 PREFLIGHT

app.options("*", cors());

/* =====================================================
   📂 STATIC FILES
===================================================== */

// 🔥 CHAT FILES

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/* =====================================================
   📡 REQUEST LOGGER
===================================================== */

app.use((
  req,
  res,
  next
) => {

  console.log(
    `📡 ${req.method} ${req.originalUrl}`
  );

  if (
    req.headers.authorization
  ) {

    console.log(
      "🔑 AUTH HEADER PRESENT"
    );

  } else {

    console.log(
      "🔑 AUTH HEADER: NONE"
    );

  }

  next();

});

/* =====================================================
   🌐 API ROUTES
===================================================== */

// 🔐 AUTH

app.use(
  "/api/auth",
  authRoutes
);

// 👤 USERS

app.use(
  "/api/users",
  userRoutes
);

// 📝 POSTS

app.use(
  "/api/posts",
  postRoutes
);

// 🤝 CONNECTIONS

app.use(
  "/api/connections",
  connectionRoutes
);

// 🔔 NOTIFICATIONS

app.use(
  "/api/notifications",
  notificationRoutes
);

// 💬 CHAT / MESSAGES

app.use(
  "/api/messages",
  messageRoutes
);

// 💬 CONVERSATIONS

app.use(
  "/api/chat",
  chatRoutes
);

// 🎓 ALUMNI

app.use(
  "/api/alumni",
  alumniRoutes
);

// 💼 JOBS

app.use(
  "/api/jobs",
  jobRoutes
);

// 📅 EVENTS

app.use(
  "/api/events",
  eventRoutes
);

// 📚 RESOURCES

app.use(
  "/api/resources",
  resourceRoutes
);

// 🔖 BOOKMARKS

app.use(
  "/api/bookmarks",
  bookmarkRoutes
);

// 👨‍🏫 TEACHERS

app.use(
  "/api/teachers",
  teacherRoutes
);

// 🛡️ ADMIN

app.use(
  "/api/admin",
  adminRoutes
);

// 🔍 SEARCH

app.use(
  "/api/search",
  searchRoutes
);

/* =====================================================
   📑 REPORTS
===================================================== */

app.use(
  "/api/reports",
  reportRoutes
);

/* =====================================================
   🏠 ROOT
===================================================== */

app.get("/", (
  req,
  res
) => {

  res.send(
    "🚀 ALU Backend Running..."
  );

});

/* =====================================================
   ❤️ HEALTH CHECK
===================================================== */

app.get("/health", (
  req,
  res
) => {

  res.status(200).json({

    success: true,

    message:
      "Server healthy ✅",

    uptime:
      process.uptime(),

    timestamp:
      new Date(),

    environment:
      process.env.NODE_ENV ||
      "development",

  });

});

/* =====================================================
   🚨 API 404 HANDLER
===================================================== */

app.use(
  "/api/*",
  (
    req,
    res
  ) => {

    console.log(
      "❌ API ROUTE NOT FOUND:",
      req.originalUrl
    );

    res.status(404).json({

      success: false,

      message:
        "API Route not found",

      route:
        req.originalUrl,

    });

  }
);

/* =====================================================
   🚨 GLOBAL ERROR HANDLER
===================================================== */

app.use((
  err,
  req,
  res,
  next
) => {

  console.error(
    "❌ GLOBAL ERROR:",
    err
  );

  res.status(
    err.status || 500
  ).json({

    success: false,

    message:
      err.message ||
      "Internal Server Error",

    stack:
      process.env.NODE_ENV ===
      "development"
        ? err.stack
        : undefined,

  });

});

/* =====================================================
   🧹 AUTO EVENT CLEANUP
===================================================== */

// 🔥 RUN EVERY 1 HOUR

setInterval(
  async () => {

    console.log(
      "🧹 Running expired event cleanup..."
    );

    await cleanupExpiredEvents();

  },

  1000 * 60 * 60
);

/* =====================================================
   🚀 SERVER START
===================================================== */

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  () => {

    console.log(
      "\n🚀 =================================="
    );

    console.log(
      `🚀 Server running on port ${PORT}`
    );

    console.log(
      `🔗 API URL: http://localhost:${PORT}/api`
    );

    console.log(
      "💬 Chat API Enabled"
    );

    console.log(
      "🤝 Connection API Enabled"
    );

    console.log(
      "👨‍🏫 Teachers API Enabled"
    );

    console.log(
      "🔔 Notification API Enabled"
    );

    console.log(
      "📨 Conversation API Enabled"
    );

    console.log(
      "📅 Event Cleanup Enabled"
    );

    console.log(
      "📂 Uploads Enabled"
    );

    console.log(
      "📑 Reports API Enabled"
    );

    console.log(
      "🔌 Socket.IO Ready"
    );

    console.log(
      "🚀 ==================================\n"
    );

  }
);