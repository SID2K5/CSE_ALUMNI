import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

/**
 * PDFViewer — full-screen overlay preview via Google Docs viewer.
 * Tokenized surfaces; closes on backdrop click or Esc (handled by parent).
 */
const PDFViewer = ({ file, onClose }) => {
  const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(
    file
  )}&embedded=true`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full h-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line shrink-0">
          <h2 className="font-semibold text-ink">PDF preview</h2>
          <div className="flex items-center gap-2">
            <a
              href={file}
              target="_blank"
              rel="noreferrer"
              className="icon-btn !w-9 !h-9 border border-line"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="icon-btn !w-9 !h-9 border border-line"
              aria-label="Close"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-surface-2">
          <iframe
            src={googleViewer}
            title="PDF preview"
            className="w-full h-full border-none"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PDFViewer;
