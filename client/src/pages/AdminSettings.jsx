import React, { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "DhoomChhalle",
    maintenanceMode: false,
    emailNotifications: true,
    multiLanguage: false,
    features: {
      socialLogin: true,
      twoFactorAuth: false,
      advancedAnalytics: true,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const response = await adminAPI.getSettings();

        if (cancelled) return;

        setSettings(response.data.data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch settings:", error);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSettingChange = (path, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      const keys = path.split(".");
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    try {
      await adminAPI.updateSettings(settings);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage admin panel settings</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General Settings */}
        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-6">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  handleSettingChange("siteName", e.target.value)
                }
                className="w-full px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">Maintenance Mode</p>
                <p className="text-slate-400 text-sm">
                  {settings.maintenanceMode
                    ? "Site is in maintenance mode"
                    : "Site is running normally"}
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "maintenanceMode",
                    !settings.maintenanceMode,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-red-600" : "bg-green-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-6">
            Email & Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-slate-400 text-sm">
                  Send email notifications to users
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "emailNotifications",
                    !settings.emailNotifications,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? "bg-blue-600" : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-6">Feature Flags</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">Social Login</p>
                <p className="text-slate-400 text-sm">
                  Allow users to login via social platforms
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "features.socialLogin",
                    !settings.features.socialLogin,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.socialLogin ? "bg-blue-600" : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.socialLogin
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">
                  Two-Factor Authentication
                </p>
                <p className="text-slate-400 text-sm">
                  Enable 2FA for additional security
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "features.twoFactorAuth",
                    !settings.features.twoFactorAuth,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.twoFactorAuth
                    ? "bg-blue-600"
                    : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.twoFactorAuth
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">Advanced Analytics</p>
                <p className="text-slate-400 text-sm">
                  Enable advanced analytics dashboard
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange(
                    "features.advancedAnalytics",
                    !settings.features.advancedAnalytics,
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.features.advancedAnalytics
                    ? "bg-blue-600"
                    : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.features.advancedAnalytics
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-600 rounded">
              <div>
                <p className="text-white font-medium">Multi-Language Support</p>
                <p className="text-slate-400 text-sm">
                  Support multiple languages in the platform
                </p>
              </div>
              <button
                onClick={() =>
                  handleSettingChange("multiLanguage", !settings.multiLanguage)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.multiLanguage ? "bg-blue-600" : "bg-slate-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.multiLanguage ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium">
              Be careful with these settings
            </p>
            <p className="text-yellow-300 text-sm">
              Some settings may affect user experience. Always test changes
              before deploying to production.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition transform hover:scale-105"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
