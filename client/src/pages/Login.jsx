import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 4 && password.length >= 8 && !isSubmitting;
  }, [email, password, isSubmitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const res = await login({
        email: email.trim(),
        password,
      });
      localStorage.setItem("token", res.data?.token);
      toast.success(res.message || "Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.25),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%)]" />

      <div className="relative max-w-md mx-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-300">
            <Sparkles size={14} />
            Welcome Back
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">Login to Dhoomchhalle</h1>
          <p className="text-sm text-zinc-300 mt-1">Continue your spiritual journey planner.</p>
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Lock size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-zinc-200 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400/60 text-white font-semibold transition-colors"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <Link
            to="/forgot-password"
            className="block w-full py-2 text-sm text-center text-orange-200 hover:text-orange-100 transition-colors"
          >
            Forgot password?
          </Link>
        </form>

        <p className="text-sm text-zinc-300 mt-5 text-center">
          New here?{" "}
          <Link to="/register" className="text-orange-300 hover:text-orange-200 underline">
            Create an account
          </Link>
        </p>
      </div>
      <Toaster />
    </section>
  );
}

export default Login;