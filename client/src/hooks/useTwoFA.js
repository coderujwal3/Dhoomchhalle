import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
    enable2FA,
    disable2FA,
    verifyOTP,
    resendOTP,
} from "../services/auth.service";

/**
 * Custom hook for managing Two-Factor Authentication
 * Handles all 2FA operations and state management
 *
 * @returns {Object} 2FA management functions and state
 */
export function useTwoFA() {
    // UI State
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showOTPVerification, setShowOTPVerification] = useState(false);

    // Data State
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [otpSessionToken, setOtpSessionToken] = useState(null);

    // Loading States
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [isResending, setIsResending] = useState(false);

    /**
     * Toggle 2FA - shows confirmation modal if enabling
     */
    const toggle2FA = useCallback(() => {
        if (twoFAEnabled) {
            // Ask for confirmation before disabling
            if (
                window.confirm(
                    "Are you sure you want to disable 2FA? Your account will be less secure."
                )
            ) {
                disable();
            }
        } else {
            // Show modal to confirm enabling 2FA
            setShow2FAModal(true);
        }
    }, [disable, twoFAEnabled]);

    /**
     * Enable 2FA - calls API and prepares for OTP verification
     */
    const enable = useCallback(async () => {
        try {
            setTwoFALoading(true);
            setShow2FAModal(false);

            // Call enable 2FA API
            const response = await enable2FA();
            setOtpSessionToken(response?.data?.otpSessionToken || null);

            // Show OTP verification modal
            setShowOTPVerification(true);
            toast.success("Check your email for OTP code");

            return response;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to enable 2FA");
            console.error("Enable 2FA error:", error);
            throw error;
        } finally {
            setTwoFALoading(false);
        }
    }, []);

    /**
     * Disable 2FA - removes additional security layer
     */
    const disable = useCallback(async () => {
        try {
            setDisabling2FA(true);
            const response = await disable2FA();
            setTwoFAEnabled(false);
            toast.success("2FA has been disabled");
            return response;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to disable 2FA");
            console.error("Disable 2FA error:", error);
            throw error;
        } finally {
            setDisabling2FA(false);
        }
    }, []);

    /**
     * Verify OTP - completes 2FA setup or login
     * @param {string} otpValue - 6-digit OTP code
     */
    const verifyCode = useCallback(
        async (otpValue, otpSessionTokenParam = null) => {
            try {
                setOtpLoading(true);
                const targetSessionToken = otpSessionTokenParam || otpSessionToken;

                // Verify OTP
                const response = await verifyOTP({
                    otp: otpValue,
                    otpSessionToken: targetSessionToken,
                });

                // Update state
                setTwoFAEnabled(true);
                setShowOTPVerification(false);
                setOtpSessionToken(null);
                toast.success("2FA verified successfully!");

                return response;
            } catch (error) {
                toast.error(error?.response?.data?.message || "Invalid OTP");
                console.error("OTP verification error:", error);
                throw error;
            } finally {
                setOtpLoading(false);
            }
        },
        [otpSessionToken]
    );

    /**
     * Resend OTP - requests new code via email
     */
    const resend = useCallback(async () => {
        try {
            setIsResending(true);
            const response = await resendOTP({ otpSessionToken });
            setOtpSessionToken(response?.data?.otpSessionToken || otpSessionToken);
            toast.success("OTP resent to your email");
            return response;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to resend OTP");
            console.error("Resend OTP error:", error);
            throw error;
        } finally {
            setIsResending(false);
        }
    }, [otpSessionToken]);

    /**
     * Cancel 2FA setup - closes modals and resets state
     */
    const cancel = useCallback(() => {
        setShow2FAModal(false);
        setShowOTPVerification(false);
        setOtpSessionToken(null);
    }, []);

    /**
     * Initialize 2FA - loads 2FA status from response
     * @param {boolean} enabled - Whether 2FA is enabled
     */
    const initialize = useCallback((enabled) => {
        setTwoFAEnabled(enabled);
    }, []);

    /**
     * Prepare for OTP verification during login
     * @param {string} sessionToken - OTP session token
     */
    const prepareForOTP = useCallback((sessionToken) => {
        setOtpSessionToken(sessionToken);
        setShowOTPVerification(true);
    }, []);

    return {
        // State
        twoFAEnabled,
        show2FAModal,
        showOTPVerification,
        otpSessionToken,

        // Loading states
        twoFALoading,
        otpLoading,
        disabling2FA,
        isResending,

        // Actions
        toggle2FA,
        enable,
        disable,
        verifyCode,
        resend,
        cancel,
        initialize,
        prepareForOTP,

        // State setters (for manual control if needed)
        setTwoFAEnabled,
        setShow2FAModal,
        setShowOTPVerification,
        setOtpSessionToken,
    };
}

/**
 * Hook for OTP countdown timer
 * @param {number} initialSeconds - Initial countdown time in seconds (default: 60)
 * @returns {Object} Timer state and controls
 */
export function useOTPTimer(initialSeconds = 60) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const start = useCallback(() => {
        setTimeLeft(initialSeconds);
        setIsRunning(true);
    }, [initialSeconds]);

    const stop = useCallback(() => {
        setTimeLeft(0);
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        stop();
    }, [stop]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    return {
        timeLeft,
        isRunning,
        isActive: timeLeft > 0,
        start,
        stop,
        reset,
    };
}
