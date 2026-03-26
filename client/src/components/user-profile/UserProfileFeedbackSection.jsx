export default function UserProfileFeedbackSection({ profile }) {
  const feedbackItems = [
    profile?.bio
      ? `${profile.bio.slice(0, 180)}${profile.bio.length > 180 ? "..." : ""}`
      : "Clean profile and active traveller history.",
    "Helpful community interactions and consistent trip logging.",
    "Profile preferences are configured for travel planning.",
  ];

  return (
    <section className="rounded-2xl border border-orange-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">My Feedbacks</h3>
        <p className="text-xs text-gray-500">Latest highlights</p>
      </div>
      <div className="space-y-3">
        {feedbackItems.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-orange-100 p-3">
            <p className="text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
