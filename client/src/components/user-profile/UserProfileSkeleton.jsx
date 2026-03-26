export default function UserProfileSkeleton({ message = "Loading user profile..." }) {
  return (
    <div className="min-h-screen bg-linear-to-r from-orange-100/60 via-orange-50/40 to-orange-200/50 pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="rounded-2xl border border-orange-200 bg-white/70 shadow-sm p-8 text-center">
          <p className="text-2xl md:text-4xl font-extrabold text-orange-700 tracking-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
