import { Hotel, Home, User } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";

export default function DashboardProfilePane({ user }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-600 mb-3">Scan to view profile</p>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <QRCode
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={`https://dhoomchhalle.vercel.app/user/${user?._id}`}
            viewBox="0 0 256 256"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
        <div className="space-y-3">
          <Link
            to="/hotels"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-200 transition"
          >
            <Hotel size={20} className="text-orange-600" />
            <span>Browse Hotels</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-200 transition"
          >
            <Home size={20} className="text-orange-600" />
            <span>Home</span>
          </Link>
          <Link
            to={user ? `/user/${user._id}` : "/user"}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-200 transition"
          >
            <User size={20} className="text-orange-600" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
