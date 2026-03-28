import { Calendar, Mail, Phone, Shield } from "lucide-react";

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

function maskEmail(email) {
  const [name, domain] = email.split("@");

  const visible = Math.floor(name.length / 3);
  const masked = "x".repeat(name.length - visible - 1);

  return name.slice(0, visible) + masked + name.slice(-1) + "@" + domain;
}

function maskPhone(phone) {
  phone = phone.toString();

  const countryCode = phone.slice(0, 3);
  const visibleStart = phone.slice(3, 5);
  const visibleEnd = phone.slice(-2);

  return `${countryCode}-${visibleStart}xxxxxx${visibleEnd}`;
}

export default function UserProfileCard({ user, profile }) {
  const avatar = profile?.avatar || profile?.avatarUrl;
  const initials = (user?.name || "U")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();

  const statItems = [
    { label: "Reviews", value: profile?.stats?.reviewsWritten || 0 },
    { label: "Trips", value: profile?.stats?.tripsCompleted || 0 },
    { label: "Hotels", value: profile?.stats?.hotelsVisited || 0 },
  ];

  return (
    <aside className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-orange-100/70 border-b border-orange-200">
        <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">
          Account
        </p>
        <p className="text-sm text-gray-700">Signed in as {user?.role}</p>
      </div>

      <div className="p-5 border-b border-orange-100">
        <div className="flex items-center gap-4">
          <div className="md:w-30 md:h-30 h-20 w-20 rounded-full border-2 border-orange-300 overflow-hidden bg-orange-200 flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt={user?.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-orange-700">
                {initials}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Name
            </p>
            <h2 className="font-bold md:text-3xl text-xl capitalize text-red-900">
              {(user?.name) || "Unknown User"}
            </h2>
          </div>
        </div>
      </div>

      <div className="divide-y divide-orange-100">
        <Row icon={Mail} label="Email" value={maskEmail(user?.email) || "—"} />
        <Row icon={Phone} label="Phone" value={maskPhone(user?.phone) || "—"} />
        <Row icon={Shield} label="Role" value={user?.role || "traveller"} />
        <Row
          icon={Calendar}
          label="Member since"
          value={formatDate(user?.createdAt)}
        />
      </div>

      <div className="grid grid-cols-3 divide-x divide-orange-100 border-t border-orange-100">
        {statItems.map((item) => (
          <div key={item.label} className="py-3 text-center">
            <p className="font-bold text-gray-900">{item.value}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <Icon size={16} className="text-orange-600" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );
}
