import { Link } from "react-router-dom";

export default function UserProfileEditControls() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link
        to="/dashboard"
        className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 transition-colors"
      >
        Edit Profile
      </Link>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold py-3 transition-colors"
      >
        Home
      </Link>
    </div>
  );
}
