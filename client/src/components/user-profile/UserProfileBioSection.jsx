export default function UserProfileBioSection({ user, profile }) {
  const bio =
    profile?.bio ||
    user?.bio ||
    "This traveller is exploring the world with Dhoomchhalle.";

  return (
    <section className="rounded-2xl border border-orange-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Profile details</h3>
        <p className="text-xs text-gray-500">Public information</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Bio</p>
          <p className="text-sm text-gray-700">{bio}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoField label="Location" value={profile?.location || "Varanasi"} />
          <InfoField
            label="Preferred language"
            value={profile?.preferences?.language || "English"}
          />
          <InfoField
            label="Currency"
            value={profile?.preferences?.currency || "INR"}
          />
          <InfoField
            label="Email notifications"
            value={profile?.preferences?.emailNotifications ? "Enabled" : "Disabled"}
          />
        </div>
      </div>
    </section>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-lg border border-orange-100 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}
