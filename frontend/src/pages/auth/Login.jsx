import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      console.log("LOGIN RESPONSE:", res.data);

      const userData = res.data;

      // Safety check
      if (!userData?.token) {
        toast.error("Login failed: Token missing");
        setLoading(false);
        return;
      }

      login(userData);

      toast.success("Welcome back 🚀");

      navigate("/feed");

    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed";

      if (message === "Account pending admin approval") {
        navigate("/pending");
      } else {
        toast.error(message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      {/* FALLBACK GRADIENT (shows if the video is unavailable) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0b1120] to-[#083344]"></div>

      {/* 🎥 BACKGROUND VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/login.mp4" type="video/mp4" />
      </video>

      {/* 🌑 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* ✨ OPTIONAL GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full top-[-100px] left-[-100px]"></div>

      {/* LOGIN CARD */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-slate-950/55 p-8 rounded-3xl shadow-2xl border border-white/15 space-y-5"
      >

        {/* TITLE */}
        <div className="text-center space-y-2">

          <p className="text-cyan-300 font-semibold tracking-[0.2em] text-xs uppercase">
            NEXUS
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back
          </h2>

          <p className="text-gray-300 text-sm">
            Connect. Collaborate. Grow.
          </p>

        </div>

        {/* EMAIL */}
        <div className="space-y-1">

          <input
            type="email"
            required
            placeholder="Enter your email"
            value={form.email}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

        </div>

        {/* PASSWORD */}
        <div className="space-y-1">

          <input
            type="password"
            required
            placeholder="Enter your password"
            value={form.password}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

        </div>

        {/* LOGIN BUTTON */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* REGISTER LINK */}
        <div className="text-center text-sm text-white">

          Don't have an account?{" "}

          <span
            onClick={() => navigate("/register")}
            className="text-cyan-300 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>

        </div>

        {/* TEST ACCOUNTS */}
        <div className="pt-3 border-t border-white/20 text-xs text-center text-gray-200 space-y-1">

          <p className="font-semibold">
            Test Accounts
          </p>

          <p>👑 Admin → sid@example.com</p>
          <p>🎓 Student → student@example.com</p>
          <p>🏢 Alumni → alumni@example.com</p>

        </div>

      </motion.form>
    </div>
  );
};

export default Login;