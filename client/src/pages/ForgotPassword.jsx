import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Mail, Shield } from "lucide-react";
import { forgotPassword } from "../services/auth.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 4 && email.includes("@") && !isSubmitting,
    [email, isSubmitting],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const response = await forgotPassword({ email: email.trim() });
      toast.success(response.message || "Reset link sent if this email exists");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.22),transparent_40%)]" />

      <div className="relative max-w-md mx-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-blue-300">
            <Shield size={14} />
            Password Recovery
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">Forgot Password</h1>
          <p className="text-sm text-zinc-300 mt-1">Enter your email to receive a secure reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-200">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Mail size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <button
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white font-semibold transition-colors"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="text-sm text-zinc-300 mt-5 text-center">
          Back to{" "}
          <Link to="/login" className="text-blue-300 hover:text-blue-200 underline">
            Login
          </Link>
        </p>
      </div>
      <Toaster />
    </section>
  );
};

export default ForgotPassword;
