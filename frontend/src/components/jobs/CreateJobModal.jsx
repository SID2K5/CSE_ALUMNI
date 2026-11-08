import { useState } from "react";
import API from "../../services/api";
import { X, Briefcase, Building2, MapPin, Link } from "lucide-react";
import { motion } from "framer-motion";

const CreateJobModal = ({ close, refresh }) => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    applyLink: "",
    description: "",
    type: "Internship",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/jobs", form);

      refresh(); // refresh job list
      close();   // close modal
    } catch (err) {
      console.error("❌ Job Post Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      onClick={close} // 🔥 CLICK OUTSIDE CLOSE
    >
      {/* 🔥 STOP PROPAGATION */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#020617] border border-gray-800 rounded-2xl p-6 relative shadow-xl"
      >
        {/* ❌ CLOSE BUTTON */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
          Post a Job 💼
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TITLE */}
          <div className="flex items-center gap-2 bg-[#0f172a] p-3 rounded-lg">
            <Briefcase size={18} />
            <input
              name="title"
              placeholder="Job Title"
              value={form.title}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* COMPANY */}
          <div className="flex items-center gap-2 bg-[#0f172a] p-3 rounded-lg">
            <Building2 size={18} />
            <input
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* LOCATION */}
          <div className="flex items-center gap-2 bg-[#0f172a] p-3 rounded-lg">
            <MapPin size={18} />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* APPLY LINK */}
          <div className="flex items-center gap-2 bg-[#0f172a] p-3 rounded-lg">
            <Link size={18} />
            <input
              name="applyLink"
              placeholder="Apply Link"
              value={form.applyLink}
              onChange={handleChange}
              required
              className="bg-transparent outline-none w-full"
            />
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Job Description..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-[#0f172a] p-3 rounded-lg outline-none"
          />

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full bg-[#0f172a] p-3 rounded-lg outline-none"
          >
            <option>Internship</option>
            <option>Full-time</option>
          </select>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
            >
              {loading ? "Posting..." : "Submit"}
            </button>

            {/* CANCEL */}
            <button
              type="button"
              onClick={close} // 🔥 FIXED
              className="flex-1 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/10 transition"
            >
              Cancel
            </button>

          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateJobModal;