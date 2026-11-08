import { io } from "socket.io-client";

/* =====================================================
   🌐 SOCKET URL
===================================================== */

// ✅ LOCALHOST (DEV)
// ✅ AUTO SUPPORTS VERCEL ENV LATER

// VITE_API_URL includes the "/api" suffix (used by services/api.js).
// Socket.IO connects to the server ROOT, so strip a trailing "/api".
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const SOCKET_URL =
  API_URL.replace(/\/api\/?$/, "");

/* =====================================================
   🔌 SOCKET INSTANCE
===================================================== */

const socket = io(
  SOCKET_URL,
  {
    /* =====================================================
       ✅ CONNECTION
    ===================================================== */

    autoConnect: false,

    withCredentials: true,

    /* =====================================================
       ✅ TRANSPORTS
       IMPORTANT FOR REALTIME PRESENCE
    ===================================================== */

    transports: [
      "websocket",
      "polling",
    ],

    /* =====================================================
       ✅ RECONNECTION
    ===================================================== */

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,

    timeout: 20000,
  }
);

/* =====================================================
   🟢 CONNECT LOG
===================================================== */

socket.on(
  "connect",
  () => {

    console.log(
      "🟢 SOCKET CONNECTED:",
      socket.id
    );
  }
);

/* =====================================================
   🔴 DISCONNECT LOG
===================================================== */

socket.on(
  "disconnect",
  (reason) => {

    console.log(
      "🔴 SOCKET DISCONNECTED:",
      reason
    );
  }
);

/* =====================================================
   ❌ CONNECTION ERROR
===================================================== */

socket.on(
  "connect_error",
  (err) => {

    console.error(
      "❌ SOCKET CONNECTION ERROR:",
      err.message
    );
  }
);

/* =====================================================
   🔄 RECONNECT
===================================================== */

socket.on(
  "reconnect",
  (attempt) => {

    console.log(
      `♻️ SOCKET RECONNECTED (${attempt})`
    );
  }
);

/* =====================================================
   🚫 RECONNECT FAILED
===================================================== */

socket.on(
  "reconnect_failed",
  () => {

    console.error(
      "❌ SOCKET RECONNECT FAILED"
    );
  }
);

export default socket;