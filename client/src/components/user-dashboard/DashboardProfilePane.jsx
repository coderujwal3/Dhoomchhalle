import { Hotel, Home, User, Map, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { useState } from "react";
import ShareModal from "./ShareModal";

export default function DashboardProfilePane({ user }) {

  const [isShareOpen, setIsShareOpen] = useState(false);

  const profileUrl = `https://dhoomchhalle.vercel.app/user/${user?._id}`;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-600 mb-3">
          Scan to view profile
        </p>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <QRCode
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={`https://dhoomchhalle.vercel.app/user/${user?._id}`}
            viewBox="0 0 256 256"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsShareOpen(true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Share Profile
          </button>
          <ShareModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            profileUrl={profileUrl}
            userName={user?.name}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
        <div className="space-y-3">
          <Link
            to="/hotels"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-400 transition"
          >
            <Hotel size={20} className="text-orange-600" />
            <span>Browse Hotels</span>
          </Link>
          <Link
            to="/route-planner"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-400 transition"
          >
            <Map size={20} className="text-orange-600" />
            <span>Plan Route</span>
          </Link>
          <Link
            to="/fare-check"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-400 transition"
          >
            <ShieldCheck size={20} className="text-orange-600" />
            <span>Fare Check</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-400 transition"
          >
            <Home size={20} className="text-orange-600" />
            <span>Home</span>
          </Link>
          <Link
            to={user ? `/user/${user._id}` : "/user"}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-400 transition"
          >
            <User size={20} className="text-orange-600" />
            <span>View Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
