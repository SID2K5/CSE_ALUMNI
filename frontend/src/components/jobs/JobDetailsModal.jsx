import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, Briefcase, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

const JobDetailsModal = ({ job, onClose }) => {
  const [fullScreen, setFullScreen] = useState(false);

  if (!job) return null;

  const handleApply = () => {
    if (job.applyLink) {
      window.open(job.applyLink, "_blank");
    } else {
      alert("Apply feature coming soon 🚀");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >

        {/* 🔥 MODAL CONTAINER */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            width: fullScreen ? "100%" : "700px",
            height: fullScreen ? "100%" : "auto",
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl p-6 relative transition-all duration-300 overflow-y-auto ${
            fullScreen ? "rounded-none" : ""
          }`}
        >

          {/* 🔥 TOP BAR */}
          <div className="flex justify-between items-center mb-4">

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-black dark:text-white">
              {job.title}
            </h2>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">

              {/* FULLSCREEN TOGGLE */}
              <button
                onClick={() => setFullScreen(!fullScreen)}
                className="text-gray-500 hover:scale-110 transition"
              >
                {fullScreen ? <Minimize2 /> : <Maximize2 />}
              </button>

              {/* CLOSE */}
              <button
                onClick={onClose}
                className="text-gray-500 hover:scale-110 transition"
              >
                <X />
              </button>

            </div>
          </div>

          {/* META INFO */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">

            <span className="flex items-center gap-1">
              <Building2 size={16} />
              {job.company}
            </span>

            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {job.location}
            </span>

            <span className="flex items-center gap-1 text-purple-500 font-medium">
              <Briefcase size={16} />
              {job.type}
            </span>

          </div>

          {/* DESCRIPTION */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {job.description}
          </div>

          {/* APPLY */}
          <button
            onClick={handleApply}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
          >
            Apply Now 🚀
          </button>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JobDetailsModal;