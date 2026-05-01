import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Star, Upload, X, Calendar } from "lucide-react";
import DOMPurify from "dompurify";
import { hotelAPI } from "../../services/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Sanitize string inputs to prevent XSS
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
};

export function ReviewForm({
  initialData = null,
  hotelId: initialHotelId = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [formData, setFormData] = useState({
    hotelId: initialHotelId || "",
    rating: 5,
    title: "",
    comment: "",
    visitDate: "",
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        hotelId: initialData.hotelId?._id || "",
        rating: initialData.rating,
        title: initialData.title,
        comment: initialData.comment,
        visitDate: initialData.visitDate?.split("T")[0],
        images: initialData.images || [],
      });
      setPreviewImages(initialData.images || []);
    }
  }, [initialData]);

  // Load hotels on component mount
  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoadingHotels(true);
        const response = await hotelAPI.getAllHotels(1, 1000);

        console.log("Hotel API Response:", response); // Debug log

        // The API returns { status: "success", data: hotels }
        const hotelsData = response.data?.data || response.data?.hotels || [];
        console.log("Extracted hotels:", hotelsData); // Debug log

        const hotelsArray = Array.isArray(hotelsData) ? hotelsData : [];
        setHotels(hotelsArray);

        if (hotelsArray.length === 0) {
          toast.error("No hotels available");
        }
      } catch (error) {
        console.error("Error loading hotels:", error);
        toast.error("Failed to load hotels: " + error.message);
      } finally {
        setLoadingHotels(false);
      }
    };
    loadHotels();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.hotelId) {
      newErrors.hotelId = "Hotel selection is required";
    }

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (formData.title.length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
    }

    if (!formData.comment || formData.comment.length < 10) {
      newErrors.comment = "Comment must be at least 10 characters";
    }

    if (formData.comment.length > 2000) {
      newErrors.comment = "Comment must not exceed 2000 characters";
    }

    if (!formData.visitDate) {
      newErrors.visitDate = "Visit date is required";
    } else {
      const visitDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (visitDate > today) {
        newErrors.visitDate = "Visit date cannot be in the future";
      }
    }

    if (formData.images.length > 5) {
      newErrors.images = "Maximum 5 images allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change with sanitization
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "visitDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else if (name === "hotelId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    } else {
      // Sanitize text inputs
      const sanitizedValue = sanitizeInput(value);

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (formData.images.length + files.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed",
      }));
      return;
    }

    const newImages = [];
    const newPreviews = [...previewImages];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(
          `Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`,
        );
        continue;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          isNew: true,
        });
        setPreviewImages([...newPreviews]);
      };
      reader.readAsDataURL(file);

      newImages.push(file);
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    if (errors.images) {
      setErrors((prev) => ({
        ...prev,
        images: undefined,
      }));
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form Data before validation:", formData); // Debug log

    if (!validateForm()) {
      console.log("Validation errors:", errors); // Debug log
      return;
    }

    console.log("Form Data after validation:", formData); // Debug log

    // Prepare data for submission
    const submitData = new FormData();
    submitData.append("hotelId", formData.hotelId);
    submitData.append("rating", formData.rating);
    submitData.append("title", formData.title);
    submitData.append("comment", formData.comment);
    submitData.append("visitDate", new Date(formData.visitDate).toISOString());

    // Add only new image files
    formData.images.forEach((img) => {
      if (img instanceof File) {
        submitData.append("images", img);
      }
    });

    console.log("FormData hotelId:", submitData.get("hotelId")); // Debug log

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold mb-6">
        {initialData ? "Edit Review" : "Write a Review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hotel Selection */}
        <div>
          <label
            htmlFor="hotelId"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Select Hotel *
          </label>
          <select
            id="hotelId"
            name="hotelId"
            value={formData.hotelId}
            onChange={handleInputChange}
            disabled={loadingHotels || !!initialData}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.hotelId ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingHotels ? "Loading hotels..." : "Choose a hotel"}
            </option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name}
              </option>
            ))}
          </select>
          {errors.hotelId && (
            <p className="text-red-500 text-sm mt-1">{errors.hotelId}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, rating: num }))
                }
                onMouseEnter={() => setHoveredRating(num)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    num <= (hoveredRating || formData.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Review Title * ({formData.title.length}/200)
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength="200"
            placeholder="Give your review a concise title"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Your Review * ({formData.comment.length}/2000)
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            maxLength="2000"
            placeholder="Share your experience in detail"
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
              errors.comment ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
        </div>

        {/* Visit Date */}
        <div>
          <label
            htmlFor="visitDate"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Visit Date *
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              id="visitDate"
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.visitDate ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.visitDate && (
            <p className="text-red-500 text-sm mt-1">{errors.visitDate}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add Photos ({previewImages.length}/5)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={previewImages.length >= 5}
              className="hidden"
              id="imageInput"
            />
            <label htmlFor="imageInput" className="cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG or WebP • Max 5MB per file • Max 5 files
              </p>
            </label>
          </div>
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}

          {/* Image Previews */}
          {previewImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.url || img}
                    alt={`Preview ${idx}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      console.error("Image load error:", e);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Submitting...
              </>
            ) : initialData ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
