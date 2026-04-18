import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Trash2, Edit2 } from "lucide-react";
import { getMyReviews, deleteReview } from "../../../services/review.service";

export function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyReviews(page, 10);
      setReviews(result.data?.reviews || []);
      setPagination(result.data?.pagination);
    } catch (error) {
      toast.error("Failed to load reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(reviewId);
        toast.success("Review deleted successfully");
        setReviews(reviews.filter((r) => r._id !== reviewId));
      } catch {
        toast.error("Failed to delete review");
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You haven't written any reviews yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Share your travel experiences by writing a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{review.title}</h3>
              <p className="text-sm text-gray-600">{review.hotelId?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Edit feature coming soon!")}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(review.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="text-yellow-500"
                  fill="currentColor"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {new Date(review.visitDate).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-600">
              {review.helpful} helpful
            </span>
          </div>

          <p className="text-gray-700 mb-3">{review.comment}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Review ${idx}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
