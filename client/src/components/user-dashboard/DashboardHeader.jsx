import { Sparkles } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="mb-8">
      <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-600/90 font-medium">
        <Sparkles size={14} />
        Your space
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold bg-linear-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent mt-1">
        Dashboard
      </h1>
      <p className="text-muted-foreground mt-2 max-w-xl">
        Manage your Dhoomchhalle account and continue your journey.
      </p>
    </div>
  );
}
