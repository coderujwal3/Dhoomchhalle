import React, { useState, useEffect, useRef } from "react";
import { X, Mail, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function OTPVerification({
  onVerify,
  onResend,
  onCancel,
  isLoading,
  title = "Verify Your Email",
  description = "We've sent a 6-digit verification code to your email address.",
  footerText = "Enter the latest code from your inbox to continue.",
  initialResendDelay = 60,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(initialResendDelay);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    setResendTimer(initialResendDelay);
    setOtp(["", "", "", "", "", ""]);
  }, [initialResendDelay]);

  // Handle countdown for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus on the next empty or last field
      const emptyIndex = newOtp.findIndex((val) => !val);
      if (emptyIndex !== -1) {
        inputRefs.current[emptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      await onVerify(otpCode);
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const handleResendClick = async () => {
    try {
      setIsResending(true);
      await onResend();
      setResendTimer(60); // 60 second countdown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Mail className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm">
            {description}
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="0"
                disabled={isLoading}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition disabled:bg-gray-100 disabled:opacity-50"
              />
            ))}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              The code will expire in 10 minutes. Check your spam folder if you
              don't see the email.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isComplete}
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resendTimer > 0 || isResending || isLoading}
            className="w-full py-2 px-4 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:text-gray-400 disabled:border-gray-400 font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : resendTimer > 0 ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Resend in {resendTimer}s
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Resend Code
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          {footerText}
        </p>
      </div>
    </div>
  );
}
