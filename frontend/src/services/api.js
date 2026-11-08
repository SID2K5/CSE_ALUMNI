import axios from "axios";

// 🔥 ENV CHECK
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ CREATE INSTANCE
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 🔥 important for future auth upgrades
});

// =====================================================
// 🔐 REQUEST INTERCEPTOR
// =====================================================
API.interceptors.request.use(
  (req) => {
    try {
      const rawUser = localStorage.getItem("user");

      if (!rawUser) {
        console.warn("⚠️ No user found in localStorage");
        return req;
      }

      const user = JSON.parse(rawUser);

      if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
      } else {
        console.warn("⚠️ Token missing in user object:", user);
      }

      // 🔥 DEBUG (DEV ONLY)
      if (import.meta.env.DEV) {
        console.log(
          `%c🚀 API Request → ${req.method?.toUpperCase()} ${req.url}`,
          "color: #22c55e"
        );
      }

    } catch (error) {
      console.error("❌ Token parse error:", error);
    }

    return req;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// =====================================================
// 📡 RESPONSE INTERCEPTOR
// =====================================================
API.interceptors.response.use(
  (response) => {
    // 🔥 DEBUG RESPONSE
    if (import.meta.env.DEV) {
      console.log(
        `%c✅ API Response ← ${response.config.url}`,
        "color: #3b82f6",
        response.data
      );
    }

    return response;
  },

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.error("❌ API ERROR:", {
      url: error.config?.url,
      status,
      message,
    });

    // =====================================================
    // 🔒 AUTH ERROR
    // =====================================================
    if (status === 401) {
      console.warn("🔒 Unauthorized → Logging out");

      localStorage.removeItem("user");

      window.location.href = "/";
    }

    // =====================================================
    // 🚫 FORBIDDEN
    // =====================================================
    if (status === 403) {
      console.warn("🚫 Forbidden:", message);
    }

    // =====================================================
    // 🌐 NETWORK ERROR (VERY IMPORTANT)
    // =====================================================
    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
      alert("Server not reachable 🚨");
    }

    return Promise.reject(error);
  }
);

export default API;