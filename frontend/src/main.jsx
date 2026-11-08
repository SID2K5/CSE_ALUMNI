import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { OnlineProvider } from "./context/OnlineContext"; // 🔥 NEW

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>

        {/* 🔥 ONLINE USERS CONTEXT (NEW) */}
        <OnlineProvider>

          {/* 🔔 Premium Toast Config */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1f2937",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px",
              },
              success: {
                style: {
                  background: "#10b981",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />

          <App />

        </OnlineProvider>

      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);