import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
} from "../../../services/profile.service";

export function SettingsTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    bio: "",
    location: "",
    preferences: {
      notifications: true,
      emailNotifications: true,
      currency: "INR",
      language: "English",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const result = await getMyProfile();
      const profileData = result.data;
      setProfile(profileData);
      setFormData({
        bio: profileData.bio || "",
        location: profileData.location || "",
        preferences: profileData.preferences || {
          notifications: true,
          emailNotifications: true,
          currency: "INR",
          language: "English",
        },
      });
    } catch (error) {
      toast.error("Failed to load settings");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadAvatar(selectedFile);
      setProfile(result.data);
      setSelectedFile(null);
      setPreview(null);
      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(profile.userId?._id || profile.userId, formData);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Avatar</h3>

          <div className="flex flex-col items-center gap-4">
            {/* Current Avatar Display */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Current avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="avatar-input"
                className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition"
              >
                <Camera className="w-5 h-5" />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="w-full text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: <strong>{selectedFile.name}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <button
                type="button"
                onClick={handleAvatarUpload}
                disabled={uploading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
              >
                {uploading ? "Uploading..." : "Upload Avatar"}
              </button>
            )}

            {/* File Type Info */}
            <p className="text-xs text-gray-500 text-center">
              Supported formats: JPEG, PNG, WebP, GIF (Max 5MB)
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Profile Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your city/location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifications"
                name="preferences.notifications"
                checked={formData.preferences.notifications}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="notifications" className="text-gray-700">
                Enable in-app notifications
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailNotifications"
                name="preferences.emailNotifications"
                checked={formData.preferences.emailNotifications}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="emailNotifications" className="text-gray-700">
                Enable email notifications
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="preferences.currency"
                  value={formData.preferences.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
