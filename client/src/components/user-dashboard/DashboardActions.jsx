import { LogOut } from "lucide-react";

export default function DashboardActions({ loggingOut, onLogout }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-3 text-sm font-semibold shadow-md disabled:opacity-60 transition-colors"
      >
        <LogOut size={18} />
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
