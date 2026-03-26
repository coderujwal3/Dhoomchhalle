import { LayoutDashboard } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function DashboardSummaryCard({ user }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-linear-to-r from-orange-500/15 via-amber-500/10 to-transparent px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
          <LayoutDashboard size={22} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Welcome, {user?.name}!</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as {user?.role || "traveller"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border">
        <Info label="Name" value={user?.name ?? "—"} />
        <Info label="Email" value={user?.email ?? "—"} className="truncate" />
        <Info label="Phone" value={user?.phone ?? "—"} />
        <Info label="Role" value={user?.role ?? "—"} className="capitalize" />
        <Info label="Member Since" value={formatDate(user?.createdAt)} />
      </div>
    </div>
  );
}

function Info({ label, value, className = "" }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className={`font-medium text-foreground text-sm ${className}`}>{value}</p>
    </div>
  );
}
