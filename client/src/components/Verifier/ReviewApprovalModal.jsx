import React, { useState } from "react";
import { X, Loader } from "lucide-react";

const ReviewApprovalModal = ({
  review,
  onApprove,
  onReject,
  onClose,
  loading,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-700/50 sticky top-0">
          <h2 className="text-xl font-semibold text-white">Review Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Hotel and Reviewer Info */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Hotel</p>
                <p className="text-white font-semibold">
                  {review.hotelId?.name || "Unknown"}
                </p>
                <p className="text-slate-400 text-xs">
                  {review.hotelId?.location || ""}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Reviewer</p>
                <p className="text-white font-semibold">
                  {review.userId?.name || "Unknown"}
                </p>
                <p className="text-slate-400 text-xs">
                  {review.userId?.email || ""}
                </p>
              </div>
            </div>
          </div>

          {/* Rating and Title */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-yellow-400">
                ⭐ {review.rating}/5
              </span>
              <span className="text-sm text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {review.title}
            </h3>
          </div>

          {/* Review Comment */}
          <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm leading-relaxed">
              {review.comment}
            </p>
          </div>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Attached Images</p>
              <div className="flex gap-2 overflow-x-auto">
                {review.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review ${idx}`}
                    className="w-20 h-20 object-cover rounded border border-slate-600"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <label className="text-slate-300 text-sm mb-2 block">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why are you rejecting this review?"
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none text-sm resize-none"
                rows="3"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/50 sticky bottom-0 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition disabled:opacity-50"
          >
            Cancel
          </button>
          {!showRejectForm ? (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Reject
              </button>
              <button
                onClick={onApprove}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Approve
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
                disabled={loading}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Confirm Rejection
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewApprovalModal;
