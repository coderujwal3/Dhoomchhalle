import { Sparkles } from "lucide-react";

export default function UserProfileHeader({ name }) {
  return (
    <div className="mb-6">
      <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-600/90 font-medium">
        <Sparkles size={14} />
        {name ? `${name}'s space` : "traveller profile"}
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold bg-linear-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent mt-1">
        User Profile
      </h1>
      <p className="text-gray-600 mt-2 max-w-xl">
        Public profile details, travel stats, and recent community feedback.
      </p>
    </div>
  );
}
