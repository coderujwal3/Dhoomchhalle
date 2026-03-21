import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/auth.service";

const strongPasswordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrong = strongPasswordRule.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = useMemo(
    () => passwordStrong && passwordsMatch && !isSubmitting && Boolean(token),
    [passwordStrong, passwordsMatch, isSubmitting, token],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const response = await resetPassword(token, { password, confirmPassword });
      toast.success(response.message || "Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.2),transparent_45%)]" />

      <div className="relative max-w-md mx-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-green-300">
            <ShieldCheck size={14} />
            Account Recovery
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">Set New Password</h1>
          <p className="text-sm text-zinc-300 mt-1">Choose a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-200">New password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Lock size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                type={showPassword ? "text" : "password"}
                minLength={8}
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-200 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Confirm new password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Lock size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                type={showConfirmPassword ? "text" : "password"}
                minLength={8}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-zinc-200 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <p className={`text-xs ${password && !passwordStrong ? "text-red-300" : "text-zinc-300"}`}>
            Use 8+ chars with uppercase, lowercase, number, and special character.
          </p>
          <p className={`text-xs ${confirmPassword && !passwordsMatch ? "text-red-300" : "text-zinc-300"}`}>
            {confirmPassword && !passwordsMatch ? "Passwords do not match." : "Both passwords must match."}
          </p>

          <button
            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-600/60 text-white font-semibold transition-colors"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <p className="text-sm text-zinc-300 mt-5 text-center">
          Back to{" "}
          <Link to="/login" className="text-green-300 hover:text-green-200 underline">
            Login
          </Link>
        </p>
      </div>
      <Toaster />
    </section>
  );
};

export default ResetPassword;
