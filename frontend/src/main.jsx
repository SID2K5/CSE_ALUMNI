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

          {/* Toasts.
              Previously: white text on #10b981 (2.54:1) and #ef4444
              (3.76:1) — both below the WCAG AA 4.5:1 minimum.
              Now a single dark neutral surface (white on #111827 is
              ~16:1) with a coloured left bar to signal the variant,
              which also keeps accent colour restrained. */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#111827",
                color: "#F8FAFC",
                borderRadius: "12px",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid #1F2937",
                borderLeftWidth: "3px",
                borderLeftColor: "#64748B",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                maxWidth: "380px",
              },
              success: {
                iconTheme: { primary: "#34D399", secondary: "#111827" },
                style: { borderLeftColor: "#34D399" },
              },
              error: {
                iconTheme: { primary: "#F87171", secondary: "#111827" },
                style: { borderLeftColor: "#F87171" },
              },
            }}
          />

          <App />

        </OnlineProvider>

      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);