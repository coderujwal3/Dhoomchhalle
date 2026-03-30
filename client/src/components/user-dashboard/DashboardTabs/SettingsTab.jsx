import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Camera, Shield, CheckCircle } from "lucide-react";
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
} from "../../../services/profile.service";
import {
  enable2FA,
  disable2FA,
  logout,
  verifyOTP,
  resendOTP,
} from "../../../services/auth.service";
import TwoFAModal from "../../../components/modals/TwoFAModal";
import OTPVerification from "../../../components/auth/OTPVerification";

export function SettingsTab() {
  const TWO_FA_ENABLE_PURPOSE = "enable_2fa";
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [otpSessionToken, setOtpSessionToken] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
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

  const extractTwoFactorState = (profileData) =>
    Boolean(
      profileData?.twoFactorEnabled ?? profileData?.userId?.twoFactorEnabled,
    );

  const wait = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyProfile();
      const profileData = result.data;
      const nextTwoFactorState = extractTwoFactorState(profileData);
      setProfile(profileData);
      setTwoFAEnabled(nextTwoFactorState);
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const waitForConfirmedTwoFactorState = useCallback(
    async (expectedState, maxAttempts = 6, delayMs = 500) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const result = await getMyProfile();
        const profileData = result.data;
        const resolvedState = extractTwoFactorState(profileData);

        if (resolvedState === expectedState) {
          return profileData;
        }

        if (attempt < maxAttempts) {
          await wait(delayMs);
        }
      }

      return null;
    },
    [],
  );

  const logoutAndNavigateToLogin = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.warn("[2FA][Settings] Logout after 2FA enable failed", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("dhoom-auth-changed"));
    navigate("/login", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((currentFormData) => ({
        ...currentFormData,
        [parent]: {
          ...currentFormData[parent],
          [child]: nextValue,
        },
      }));
    } else {
      setFormData((currentFormData) => ({
        ...currentFormData,
        [name]: nextValue,
      }));
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
      const targetUserId = profile?.userId?._id || profile?.userId;
      const result = await updateProfile(targetUserId, formData);
      await fetchProfile();
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handle2FAToggle = () => {
    if (twoFAEnabled) {
      // Ask for confirmation before disabling
      if (
        window.confirm(
          "Are you sure you want to disable 2FA? Your account will be less secure.",
        )
      ) {
        handleDisable2FA();
      }
    } else {
      // Show modal to confirm enabling 2FA
      setShow2FAModal(true);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setTwoFALoading(true);
      setShow2FAModal(false);

      // Call enable 2FA API
      const response = await enable2FA();
      const nextOtpSessionToken = response?.data?.otpSessionToken || null;
      console.log("[2FA][Settings] Enable 2FA response", {
        message: response?.message,
        requiresOTP: response?.data?.requiresOTP,
        hasOtpSessionToken: Boolean(nextOtpSessionToken),
      });
      setOtpSessionToken(nextOtpSessionToken);

      // Show OTP verification modal
      setShowOTPVerification(true);
      toast.success("Check your email for OTP code");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to enable 2FA");
      console.error("Enable 2FA error:", error);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setDisabling2FA(true);
      await disable2FA();
      setTwoFAEnabled(false);
      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              twoFactorEnabled: false,
            }
          : currentProfile,
      );
      await fetchProfile();
      toast.success("2FA has been disabled");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to disable 2FA");
      console.error("Disable 2FA error:", error);
    } finally {
      setDisabling2FA(false);
    }
  };

  const handleOTPSubmit = async (otpValue) => {
    try {
      setOtpLoading(true);

      // Verify OTP
      const response = await verifyOTP({
        otp: otpValue,
        otpSessionToken,
        purpose: TWO_FA_ENABLE_PURPOSE,
      });

      const enabledState = Boolean(response?.data?.twoFactorEnabled ?? true);

      const confirmedProfile =
        enabledState === true
          ? await waitForConfirmedTwoFactorState(true)
          : null;

      if (!confirmedProfile) {
        toast.error(
          "OTP verified, but 2FA is not confirmed in your profile yet. Please check the server logs.",
        );
        console.warn("[2FA][Settings] 2FA state was not confirmed after OTP verify");
        return;
      }

      setTwoFAEnabled(true);
      setProfile(confirmedProfile);
      setShowOTPVerification(false);
      setOtpSessionToken(null);
      toast.success("2FA enabled successfully! Please log in again.");
      await logoutAndNavigateToLogin();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid OTP");
      console.error("OTP verification error:", error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await resendOTP({
        otpSessionToken,
        purpose: TWO_FA_ENABLE_PURPOSE,
      });
      setOtpSessionToken(response?.data?.otpSessionToken || otpSessionToken);
      toast.success("OTP resent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
      console.error("Resend OTP error:", error);
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

        {/* 2FA Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-500" />
              <h3 className="font-bold text-lg">Two-Factor Authentication</h3>
            </div>
            {twoFAEnabled && (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                Enabled
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {twoFAEnabled
              ? "Your account is protected with two-factor authentication. You'll need to verify with an OTP code when logging in."
              : "Add an extra layer of security to your account by enabling two-factor authentication. You'll receive an OTP code via email when logging in."}
          </p>

          <button
            type="button"
            onClick={handle2FAToggle}
            disabled={twoFALoading || disabling2FA}
            className={`w-full font-bold py-2 px-4 rounded-lg transition ${
              twoFAEnabled
                ? "bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white"
                : "bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white"
            }`}
          >
            {twoFALoading || disabling2FA
              ? twoFAEnabled
                ? "Disabling..."
                : "Enabling..."
              : twoFAEnabled
                ? "Disable 2FA"
                : "Enable 2FA"}
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* 2FA Modal */}
      {show2FAModal && (
        <TwoFAModal
          onConfirm={handleEnable2FA}
          onCancel={() => setShow2FAModal(false)}
          isLoading={twoFALoading}
        />
      )}

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <OTPVerification
          onVerify={handleOTPSubmit}
          onResend={handleResendOTP}
          title="Enable Two-Factor Authentication"
          description="Enter the 6-digit code we emailed to verify your address and turn on 2FA."
          footerText="Verifying this code will enable two-factor authentication for your account."
          onCancel={() => {
            setShowOTPVerification(false);
            setOtpSessionToken(null);
          }}
          isLoading={otpLoading}
        />
      )}
    </div>
  );
}
