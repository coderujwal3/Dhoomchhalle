import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function TwoFAModal({ onConfirm, onCancel, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Enable 2FA?</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Two-Factor Authentication adds an extra layer of security to your
              account.
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-orange-500 shrink-0">
                1.
              </span>
              <p>We'll send you a 6-digit code via email</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-orange-500 shrink-0">
                2.
              </span>
              <p>You'll need to enter this code to complete 2FA setup</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-orange-500 shrink-0">
                3.
              </span>
              <p>From now on, you'll need this code to log in</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-orange-500 shrink-0">
                4.
              </span>
              <p>You will be redirected to the login page, after successful 2FA setup</p>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              ✓ Your account will be much more secure
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition disabled:opacity-50 disabled:bg-gray-400"
          >
            {isLoading ? "Enabling..." : "Enable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
