export default function DashboardTabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
        active
          ? "border-orange-500 text-orange-600 bg-orange-50"
          : "border-transparent text-gray-600 hover:text-gray-800"
      }`}
    >
      <Icon size={18} />
      <span className="hidden cursor-pointer sm:inline">{label}</span>
    </button>
  );
}
