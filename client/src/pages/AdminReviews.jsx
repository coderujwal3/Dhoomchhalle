import React, { useState, useEffect } from "react";
import { Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectionReason, setRejectionReason] = useState({});
  const [showReasonInput, setShowReasonInput] = useState({});

  async function fetchPendingReviews() {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingReviews(currentPage, 10);
      setReviews(response.data.data.reviews);
      setTotalPages(response.data.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch reviews");
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getPendingReviews(currentPage, 10);

        if (cancelled) return;

        setReviews(response.data.data.reviews);
        setTotalPages(response.data.data.pagination.pages);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || "Failed to fetch reviews");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const handleApproveReview = async (reviewId) => {
    try {
      await adminAPI.approveReview(reviewId);
      toast.success("Review approved");
      fetchPendingReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve review");
    }
  };

  const handleRejectReview = async (reviewId) => {
    const reason = rejectionReason[reviewId] || "Inappropriate content";
    try {
      await adminAPI.rejectReview(reviewId, reason);
      toast.success("Review rejected");
      setRejectionReason({ ...rejectionReason, [reviewId]: "" });
      setShowReasonInput({ ...showReasonInput, [reviewId]: false });
      fetchPendingReviews();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? "text-yellow-400" : "text-slate-400"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Review Moderation
        </h1>
        <p className="text-slate-400">Approve or reject pending user reviews</p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600 hover:ring-slate-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-2">
                      Hotel: {review.hotelId}
                    </p>
                    {renderStars(review.rating)}
                    <div className="flex items-center gap-1 text-slate-400 text-sm mt-2">
                      <Clock className="w-4 h-4" />
                      {new Date(review.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-yellow-600 text-white rounded-full text-xs font-semibold">
                    Pending
                  </span>
                </div>

                <div className="bg-slate-600 rounded p-4 mb-4">
                  <p className="text-slate-200">
                    {review.comment || "No comment provided"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveReview(review._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>

                  <button
                    onClick={() => {
                      setShowReasonInput({
                        ...showReasonInput,
                        [review._id]: !showReasonInput[review._id],
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>

                {/* Rejection Reason Input */}
                {showReasonInput[review._id] && (
                  <div className="mt-4 pt-4 border-t border-slate-500">
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason[review._id] || ""}
                      onChange={(e) =>
                        setRejectionReason({
                          ...rejectionReason,
                          [review._id]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-red-500 focus:outline-none mb-3"
                      rows="3"
                    />
                    <button
                      onClick={() => handleRejectReview(review._id)}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg ring-1 ring-slate-600">
              <p className="text-sm text-slate-300">
                Page{" "}
                <span className="font-semibold text-white">{currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-700 rounded-lg p-8 ring-1 ring-slate-600 text-center">
            <p className="text-slate-300 text-lg">
              No pending reviews to moderate
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
