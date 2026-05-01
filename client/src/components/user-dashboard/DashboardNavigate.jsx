import { ArrowRight } from "lucide-react";

export default function DashboardNavigate({ user, Navigating, onNavigate }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onNavigate}
        disabled={Navigating}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 hover:bg-red-600 text-white px-4 py-3 text-sm font-semibold shadow-md disabled:opacity-60 transition-colors"
      >
        <ArrowRight size={18} />
        {Navigating ? "Navigating..." : `${user?.role} Dashboard`}
      </button>
    </div>
  );
}
