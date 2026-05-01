import React, { useState, useEffect } from "react";
import {
  getPendingReviews,
  getApprovedReviews,
  getRejectedReviews,
  approveReview,
  rejectReview,
} from "../services/api/verifierAPI";
import toast from "react-hot-toast";
import ReviewApprovalModal from "../components/Verifier/ReviewApprovalModal";

const VerifierReviewsList = ({ filterStatus = "pending" }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews(1);
  }, [appliedSearch, sort, filterStatus]);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      let response;

      if (filterStatus === "approved") {
        response = await getApprovedReviews(page, 20);
      } else if (filterStatus === "rejected") {
        response = await getRejectedReviews(page, 20);
      } else {
        response = await getPendingReviews(page, 20, appliedSearch, sort);
      }

      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      setActionLoading(true);
      await approveReview(reviewId);
      toast.success("Review approved successfully");
      setModalOpen(false);
      fetchReviews(pagination.currentPage);
    } catch (error) {
      console.error("Error approving review:", error);
      toast.error("Failed to approve review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reviewId, reason) => {
    try {
      setActionLoading(true);
      await rejectReview(reviewId, reason);
      toast.success("Review rejected successfully");
      setModalOpen(false);
      fetchReviews(pagination.currentPage);
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast.error("Failed to reject review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-800 p-8 border border-slate-700">
      {/* Search and Filter (only for pending) */}
      {filterStatus === "pending" && (
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                setAppliedSearch(search);
              }
            }}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={() => setAppliedSearch(search)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            Search
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>No {filterStatus} reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Date
                  </th>
                  {filterStatus === "rejected" && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Rejection Reason
                    </th>
                  )}
                  {filterStatus === "pending" && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr
                    key={review._id}
                    className={`border-b border-slate-700 hover:bg-slate-700/50 transition ${
                      index % 2 === 0 ? "bg-slate-800" : "bg-slate-800/50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {review.userId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {review.hotelId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                        ⭐ {review.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 truncate">
                      {review.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    {filterStatus === "rejected" && (
                      <td className="px-6 py-4 text-sm text-slate-300 truncate">
                        {review.rejectionReason || "N/A"}
                      </td>
                    )}
                    {filterStatus === "pending" && (
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setModalOpen(true);
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-xs font-semibold"
                        >
                          Review
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => fetchReviews(page)}
                className={`px-3 py-2 rounded ${
                  page === pagination.currentPage
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedReview && filterStatus === "pending" && (
        <ReviewApprovalModal
          review={selectedReview}
          onApprove={() => handleApprove(selectedReview._id)}
          onReject={(reason) => handleReject(selectedReview._id, reason)}
          onClose={() => {
            setModalOpen(false);
            setSelectedReview(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default VerifierReviewsList;
