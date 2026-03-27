import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../services/auth.service";

const COUNTRY_CODES = [
  { code: "+1", country: "United States", flag: "🇺🇸", maxLength: 10 },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", maxLength: 10 },
  { code: "+91", country: "India", flag: "🇮🇳", maxLength: 10 },
  { code: "+86", country: "China", flag: "🇨🇳", maxLength: 11 },
  { code: "+81", country: "Japan", flag: "🇯🇵", maxLength: 10 },
  { code: "+49", country: "Germany", flag: "🇩🇪", maxLength: 10 },
  { code: "+33", country: "France", flag: "🇫🇷", maxLength: 9 },
  { code: "+61", country: "Australia", flag: "🇦🇺", maxLength: 9 },
  { code: "+55", country: "Brazil", flag: "🇧🇷", maxLength: 11 },
  { code: "+39", country: "Italy", flag: "🇮🇹", maxLength: 10 },
];

const strongPasswordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[2]); // Default to India
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("traveller"); // Default to "traveller"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const passwordIsStrong = strongPasswordRule.test(password);
  const phoneIsValid =
    phone.length === countryCode.maxLength && /^\d+$/.test(phone);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().includes("@") &&
      phoneIsValid &&
      passwordIsStrong &&
      passwordsMatch &&
      !isSubmitting
    );
  }, [
    name,
    email,
    phoneIsValid,
    passwordIsStrong,
    passwordsMatch,
    isSubmitting,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const formattedPhone = `${countryCode.code}${phone}`;
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: formattedPhone,
        role,
        password,
        confirmPassword,
      });
      localStorage.setItem("token", res.data?.token);
      toast.success(res.message || "Registered successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.2),transparent_40%)]" />

      <div className="relative max-w-md mx-auto rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-300">
            <Sparkles size={14} />
            Join Dhoomchhalle
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">
            Create your account
          </h1>
          <p className="text-sm text-zinc-300 mt-1">
            Plan stays, routes, and experiences in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-zinc-200">Full name</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <User size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Mail size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Phone number</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              {/* <Phone size={16} className="text-zinc-300" /> */}

              {/* Country Code Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountries(!showCountries)}
                  className="flex items-center gap-2 px-2 py-3 hover:bg-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="text-lg text-zinc-400">
                    {countryCode.flag}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {countryCode.code}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>

                {showCountries && (
                  <div className="absolute left-0 top-full mt-1 w-60 bg-zinc-800 border border-white/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setCountryCode(country);
                          setShowCountries(false);
                          setPhone(""); // Reset phone when country changes
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-3 text-zinc-300 hover:text-white text-sm"
                      >
                        <span className="text-lg text-white">
                          {country.flag}
                        </span>
                        <span className="flex-1">{country.country}</span>
                        <span className="text-zinc-400 text-xs">
                          {country.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                type="tel"
                inputMode="numeric"
                maxLength={countryCode.maxLength}
                placeholder={`${countryCode.maxLength}-digit number`}
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, countryCode.maxLength),
                  )
                }
              />
            </div>
            <p
              className={`text-xs mt-1 text-right ${phone && !phoneIsValid ? "text-red-300" : "text-zinc-300"}`}
            >
              {phone && !phoneIsValid
                ? `Please enter ${countryCode.maxLength} digits`
                : `Enter ${countryCode.maxLength}-digit number for ${countryCode.country}`}
            </p>
          </label>

          <div className="block">
            <div className="flex gap-2 items-center">
              <User size={16} className="text-zinc-300" />
              <span className="text-sm text-zinc-200">Role</span>
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 p-3">
              <input
                type="radio"
                name="role"
                id="traveller"
                value="traveller"
                checked={role === "traveller"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="traveller" className="text-md text-white/90">
                Traveller
              </label>
              <input
                type="radio"
                name="role"
                id="verifier"
                value="verifier"
                checked={role === "verifier"}
                onChange={(e) => setRole(e.target.value)}
              />
              <label htmlFor="verifier" className="text-md text-white/90">
                Verifier
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-zinc-200">Password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Lock size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
            <p
              className={`text-xs mt-1 ${password && !passwordIsStrong ? "text-red-300" : "text-zinc-300"}`}
            >
              Use 8+ chars with uppercase, lowercase, number, and special
              character.
            </p>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Confirm password</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3">
              <Lock size={16} className="text-zinc-300" />
              <input
                className="w-full py-3 bg-transparent text-white outline-none placeholder:text-zinc-400"
                required
                minLength={8}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-zinc-200 hover:text-white transition-colors"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p
              className={`text-xs mt-1 ${confirmPassword && !passwordsMatch ? "text-red-300" : "text-zinc-300"}`}
            >
              {confirmPassword && !passwordsMatch
                ? "Passwords do not match."
                : "Both passwords must match."}
            </p>
          </label>

          <button
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400/60 text-white font-semibold transition-colors"
            type="submit"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-zinc-300 mt-5 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-300 hover:text-orange-200 underline"
          >
            Login here
          </Link>
        </p>
      </div>
      <Toaster />
    </section>
  );
}

export default Register;
