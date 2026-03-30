import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePhotoModal({ isOpen, onClose, profile, userName }) {
  const avatar = profile?.avatar || profile?.avatarUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* MODAL CARD */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              scale: 0.8,
              opacity: 0,
              y: 40,
              borderRadius: ["20px", "50px", "50%", "100%"],
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-[90%] max-w-md p-6 rounded-2xl shadow-2xl 
                       bg-white/70 backdrop-blur-xl border border-white/30"
          >
            {/* CLOSE button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200/50 transition"
            >
              <X size={20} />
            </button>

            {/* TITLE */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-5 tracking-wide">
              You Look Good
            </h2>

            {/* QR */}
            <div className="flex items-center justify-center mb-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-2 h-60 w-60 bg-white rounded-full flex items-end justify-center border-gray-400 border shadow-[0px_0px_8px_black]/80"
              >
                <img
                  src={avatar}
                  className="h-full w-full rounded-full object-cover"
                  alt={`${userName || "User-profile-photo"}`}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
