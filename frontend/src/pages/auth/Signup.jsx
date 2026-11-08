import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);

      toast.success("Signup successful! Waiting for admin approval ⏳");
      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400">

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-lg bg-white/30 dark:bg-gray-900/60 p-8 rounded-2xl shadow-2xl w-96 space-y-5 border border-white/20"
      >

        <h2 className="text-3xl font-bold text-center gradient-text">
          Create Account 🚀
        </h2>

        {/* NAME */}
        <input
          placeholder="Full Name"
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-gray-800 text-black dark:text-white"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-gray-800 text-black dark:text-white"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-gray-800 text-black dark:text-white"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* ROLE SELECT */}
        <select
          className="w-full p-3 rounded-xl bg-white/80 dark:bg-gray-800 text-black dark:text-white"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
        </select>

        {/* BUTTON */}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition">
          Sign Up
        </button>

      </motion.form>

    </div>
  );
};

export default Signup;