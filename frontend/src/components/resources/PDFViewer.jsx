import { motion } from "framer-motion";
import { X } from "lucide-react";

const PDFViewer = ({ file, onClose }) => {
  // 🔥 Fallback viewer (Google Docs)
  const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(file)}&embedded=true`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-[95%] h-[95%] bg-white dark:bg-[#020617] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-black dark:text-white">
            Preview
          </h2>

          <button
            onClick={onClose}
            className="text-red-500 hover:scale-110 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* VIEWER */}
        <div className="flex-1">
          <iframe
            src={googleViewer}
            title="PDF Preview"
            className="w-full h-full border-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PDFViewer;