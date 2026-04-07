import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Globe,
  Hotel,
  IndianRupee,
  LocateFixed,
  MapPin,
  Images,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import { adminAPI } from "../../services/api/adminAPI";

const INITIAL_FORM = {
  name: "",
  location: "",
  address: "",
  category: "",
  pricePerNight: "",
  contactNumber: "",
  websiteUrl: "",
  checkIn: "",
  checkOut: "",
  description: "",
  amenities: "",
  avgRating: "",
};

const CATEGORY_OPTIONS = [
  { label: "Budget", value: "budget" },
  { label: "Mid", value: "mid" },
  { label: "Luxury", value: "luxury" },
  { label: "Hostel", value: "hostel" },
];

function AddHotelForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const canSubmit = useMemo(() => {
    const requiredKeys = ["name", "location", "category", "pricePerNight"];
    const hasRequiredValues = requiredKeys.every((key) =>
      String(formData[key] || "").trim(),
    );

    const isPriceValid = Number(formData.pricePerNight) > 0;
    const isRatingValid =
      formData.avgRating === "" ||
      (Number(formData.avgRating) >= 0 && Number(formData.avgRating) <= 5);
    const isContactValid =
      formData.contactNumber === "" || /^[0-9]{10}$/.test(formData.contactNumber);

    return hasRequiredValues && isPriceValid && isRatingValid && isContactValid;
  }, [formData]);

  const updateField = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSelectedPhotos([]);
  };

  const photoPreviewUrls = useMemo(
    () => selectedPhotos.map((file) => URL.createObjectURL(file)),
    [selectedPhotos],
  );

  React.useEffect(() => {
    return () => {
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handlePhotoSelection = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      setSelectedPhotos([]);
      return;
    }

    if (files.length > 10) {
      toast.error("You can upload up to 10 photos only.");
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ),
    );

    if (invalidFile) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      toast.error("Each image must be 5MB or less.");
      return;
    }

    setSelectedPhotos(files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Please fill required fields with valid values.");
      return;
    }

    const amenities = formData.amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("location", formData.location.trim());
    payload.append("address", formData.address.trim());
    payload.append("category", formData.category);
    payload.append("pricePerNight", String(Number(formData.pricePerNight)));
    payload.append("contactNumber", formData.contactNumber.trim());
    payload.append("websiteUrl", formData.websiteUrl.trim());
    payload.append("checkIn", formData.checkIn);
    payload.append("checkOut", formData.checkOut);
    payload.append("description", formData.description.trim());
    payload.append("amenities", amenities.join(","));
    payload.append(
      "avgRating",
      String(formData.avgRating === "" ? 0 : Number(formData.avgRating)),
    );

    selectedPhotos.forEach((photo) => {
      payload.append("photos", photo);
    });

    try {
      setIsSubmitting(true);
      const response = await adminAPI.createHotel(payload);
        toast.success(response?.data?.message || "Hotel added successfully.");
        navigate("/admin/hotels");
      resetForm();
    } catch (error) {
      const statusCode = error?.response?.status;
      if (statusCode === 404) {
        toast.error("Add hotel API route is not available yet.");
      } else {
        toast.error(
          error?.response?.data?.message || "Could not add hotel. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10 sm:py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.2),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-300">
              <Sparkles size={14} />
              Admin Panel
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Add New Hotel
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Fill in the hotel details to create a new listing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/hotels")}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hotels
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-200">Hotel Name *</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Hotel className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="text"
                  placeholder="e.g., Ganga River Retreat"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Location *</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <MapPin className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="text"
                  placeholder="e.g., Varanasi, Uttar Pradesh"
                  value={formData.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Category *</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Hotel className="h-4 w-4 text-slate-300" />
                <select
                  className="w-full bg-transparent py-3 text-white outline-none"
                  value={formData.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-200">
                    Select category
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-slate-900 text-slate-200"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Price / Night (INR) *</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <IndianRupee className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="number"
                  min={1}
                  placeholder="e.g., 2500"
                  value={formData.pricePerNight}
                  onChange={(event) => updateField("pricePerNight", event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Contact Number</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Phone className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={formData.contactNumber}
                  onChange={(event) =>
                    updateField(
                      "contactNumber",
                      event.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Website URL</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Globe className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="url"
                  placeholder="https://your-hotel-site.com"
                  value={formData.websiteUrl}
                  onChange={(event) => updateField("websiteUrl", event.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Check-in Time</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Clock3 className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none"
                  type="time"
                  value={formData.checkIn}
                  onChange={(event) => updateField("checkIn", event.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Check-out Time</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Clock3 className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none"
                  type="time"
                  value={formData.checkOut}
                  onChange={(event) => updateField("checkOut", event.target.value)}
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-200">Address</span>
              <div className="mt-1 flex items-start gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <LocateFixed className="mt-3 h-4 w-4 text-slate-300" />
                <textarea
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  rows={3}
                  placeholder="Full hotel address"
                  value={formData.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-200">Description</span>
              <div className="mt-1 flex items-start gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <FileText className="mt-3 h-4 w-4 text-slate-300" />
                <textarea
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  rows={4}
                  placeholder="Highlight what makes this hotel special"
                  value={formData.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-200">
                Amenities (comma separated)
              </span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Sparkles className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="text"
                  placeholder="Wi-Fi, Parking, Breakfast, AC"
                  value={formData.amenities}
                  onChange={(event) => updateField("amenities", event.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Average Rating (0 - 5)</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
                <Star className="h-4 w-4 text-slate-300" />
                <input
                  className="w-full bg-transparent py-3 text-white outline-none placeholder:text-slate-400"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  placeholder="e.g., 4.2"
                  value={formData.avgRating}
                  onChange={(event) => updateField("avgRating", event.target.value)}
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm text-slate-200">Hotel Photos</span>
              <div className="mt-1 rounded-xl border border-white/20 bg-black/20 px-3 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Images className="h-4 w-4" />
                  <p className="text-xs">
                    Upload up to 10 images (JPEG, PNG, WebP, GIF, max 5MB each).
                    First image will appear as cover.
                  </p>
                </div>
                <input
                  className="mt-3 block w-full text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-white hover:file:bg-orange-600"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handlePhotoSelection}
                />

                {photoPreviewUrls.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {photoPreviewUrls.map((url, index) => (
                      <img
                        key={`${url}-${index}`}
                        src={url}
                        alt={`Hotel preview ${index + 1}`}
                        className="h-24 w-full rounded-lg border border-white/20 object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-400/60"
            >
              {isSubmitting ? "Adding Hotel..." : "Add Hotel"}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </section>
  );
}

export default AddHotelForm;
