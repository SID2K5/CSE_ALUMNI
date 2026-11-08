import { motion } from "framer-motion";
import { MapPin, Building2, Briefcase } from "lucide-react";
import { useState } from "react";
import JobDetailsModal from "./JobDetailsModal";

const JobCard = ({ job }) => {
  const [open, setOpen] = useState(false);

  const handleApply = (e) => {
    e.stopPropagation(); // prevent modal open

    if (job.applyLink) {
      window.open(job.applyLink, "_blank");
    } else {
      alert("Apply feature coming soon 🚀");
    }
  };

  return (
    <>
      {/* CARD */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        onClick={() => setOpen(true)}
        className="cursor-pointer relative p-[1px] rounded-2xl"
      >
        {/* 🔥 GLOW EFFECT */}
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition duration-300 blur-md bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500"></div>

        {/* CARD CONTENT */}
        <div className="relative p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition flex flex-col justify-between h-[220px]">

          {/* TOP */}
          <div className="space-y-2 overflow-hidden">

            <h2 className="font-semibold text-lg text-black dark:text-white truncate">
              {job.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 truncate">
              <Building2 size={14} />
              {job.company}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 truncate">
              <MapPin size={14} />
              {job.location}
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-500 font-medium">
              <Briefcase size={14} />
              {job.type}
            </div>

            {/* 🔥 STRICT CLAMP (NO BREAKING UI) */}
            <p className="text-xs text-gray-500 line-clamp-2 break-words">
              {job.description}
            </p>

          </div>

          {/* ACTION */}
          <button
            onClick={handleApply}
            className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold hover:scale-105 transition"
          >
            Apply
          </button>

        </div>
      </motion.div>

      {/* MODAL */}
      {open && (
        <JobDetailsModal
          job={job}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default JobCard;