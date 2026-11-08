import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    department: "",
    passOutYear: "",
    email: "",
    rollNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await API.post("/auth/register", form);

      toast.success(
        "Registration submitted for admin approval 🚀"
      );

      navigate("/pending");

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-10 px-4">

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

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* ✨ GLOW EFFECT */}
      <div className="absolute w-[600px] h-[600px] bg-cyan-500/20 blur-3xl rounded-full top-[-150px] right-[-150px]"></div>

      {/* REGISTER FORM */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/10 dark:bg-gray-900/30 p-8 rounded-3xl shadow-2xl border border-white/20 space-y-5"
      >

        {/* TITLE */}
        <div className="text-center space-y-2">

          <h2 className="text-4xl font-bold text-white">
            Join NEXUS 🚀
          </h2>

          <p className="text-gray-200 text-sm">
            Build your network. Shape your future.
          </p>

        </div>

        {/* FULL NAME */}
        <input
          type="text"
          required
          placeholder="Full Name"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* DEPARTMENT */}
        <input
          type="text"
          required
          placeholder="Department"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) =>
            setForm({
              ...form,
              department: e.target.value,
            })
          }
        />

        {/* PASSOUT YEAR */}
        <input
          type="number"
          required
          placeholder="Pass Out Year"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setForm({
              ...form,
              passOutYear: e.target.value,
            })
          }
        />

        {/* EMAIL */}
        <input
          type="email"
          required
          placeholder="Email ID"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {/* ROLL NUMBER */}
        <input
          type="text"
          required
          placeholder="Roll No / Registration Number"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) =>
            setForm({
              ...form,
              rollNumber: e.target.value,
            })
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          required
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {/* BUTTON */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "Submitting..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <div className="text-center text-sm text-white">

          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            className="text-cyan-300 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>

        </div>

      </motion.form>
    </div>
  );
};

export default Register;