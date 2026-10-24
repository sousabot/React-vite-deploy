import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useOverlay } from "../../hooks/useOverlay.js";

export default function Modal({ open, title, onClose, wide = false, children }) {
  useOverlay(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`modal ${wide ? "modal--wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="modal__head">
              <div className="modal__title">{title}</div>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                <FiX />
              </button>
            </div>
            <div className="modal__body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
