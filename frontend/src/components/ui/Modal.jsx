import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal — portal + backdrop + focus-trap-lite. Closes on Esc / backdrop click.
 *
 *   open: boolean
 *   onClose: () => void
 *   title: string | ReactNode
 *   size: "sm" | "md" | "lg" | "xl"           (default "md")
 *   footer: ReactNode (sticky)
 *   closeOnBackdrop: default true
 */
const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({
  open,
  onClose,
  title,
  size = "md",
  footer,
  closeOnBackdrop = true,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => closeOnBackdrop && onClose?.()}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === "string" ? title : "dialog"}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`card w-full ${sizeMap[size]} rounded-t-[20px] sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || onClose) && (
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line shrink-0">
                <h2 className="font-display font-semibold text-ink text-lg truncate">
                  {title}
                </h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="icon-btn !w-9 !h-9"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
            {footer && (
              <div className="shrink-0 px-5 py-3 border-t border-line bg-surface-2/50">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
