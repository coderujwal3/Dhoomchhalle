import React from "react";
import { User, Hotel, Star, Clock } from "lucide-react";

const RecentActivityFeed = ({ activities }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
      <h3 className="text-white font-semibold mb-6">Recent Activities</h3>

      <div className="space-y-4">
        {/* Recent Users */}
        {activities?.users && activities.users.length > 0 && (
          <div>
            <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Latest Users
            </h4>
            <div className="space-y-2">
              {activities.users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between bg-slate-600 rounded p-3 hover:bg-slate-500 transition"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-amber-500 text-white"
                        : user.role === "verifier"
                          ? "bg-purple-500 text-white"
                          : "bg-blue-500 text-white"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Hotels */}
        {activities?.hotels && activities.hotels.length > 0 && (
          <div>
            <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2 mt-6">
              <Hotel className="w-4 h-4" /> Latest Hotels
            </h4>
            <div className="space-y-2">
              {activities.hotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="flex items-center justify-between bg-slate-600 rounded p-3 hover:bg-slate-500 transition"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{hotel.name}</p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(hotel.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      hotel.verified
                        ? "bg-green-500 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {hotel.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {activities?.reviews && activities.reviews.length > 0 && (
          <div>
            <h4 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2 mt-6">
              <Star className="w-4 h-4" /> Latest Reviews
            </h4>
            <div className="space-y-2">
              {activities.reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex items-center justify-between bg-slate-600 rounded p-3 hover:bg-slate-500 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">
                        Rating: {review.rating}/5
                      </p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-slate-400"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      review.status === "approved"
                        ? "bg-green-500 text-white"
                        : review.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-600 text-white"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;
