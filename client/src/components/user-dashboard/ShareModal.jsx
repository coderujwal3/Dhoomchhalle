import { X, Copy, Share2, Download } from "lucide-react";
import QRCode from "react-qr-code";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareModal({ isOpen, onClose, profileUrl, userName }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Check my profile",
        url: profileUrl,
      });
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${userName}-qr.svg`;
    link.click();
  };

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
            <h2 className="text-xl font-semibold text-center mb-5 tracking-wide">
              Share Your Profile
            </h2>

            {/* QR */}
            <div className="flex justify-center mb-5">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white rounded-xl border-gray-400 border shadow-[0px_0px_8px_black]/80"
              >
                <QRCode id="qr-code-svg" value={profileUrl} size={170} />
              </motion.div>
            </div>

            {/* URL */}
            <p className="text-sm text-gray-600 text-center break-all mb-5 px-2">
              {profileUrl}
            </p>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCopy}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition shadow-sm"
              >
                <Copy size={18} />
                <span className="text-xs">Copy</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleShare}
                className="flex flex-col items-center gap-1 p-3 rounded-xl 
                           bg-linear-to-r from-orange-500 to-orange-600 
                           text-white shadow-md hover:shadow-lg"
              >
                <Share2 size={18} />
                <span className="text-xs">Share</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleDownloadQR}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition shadow-sm"
              >
                <Download size={18} />
                <span className="text-xs">QR</span>
              </motion.button>
            </div>

            <Toaster position="top-center" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
