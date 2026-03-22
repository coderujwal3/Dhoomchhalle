import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Calendar,
  Hotel,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getSession, logout } from "../services/auth.service";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const body = await getSession();
        if (!cancelled && body?.data?.user) {
          setUser(body.data.user);
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load your profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Still clear client session
    }
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/", { replace: true });
    setLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/20 to-muted/40 pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-600/90 font-medium">
            <Sparkles size={14} />
            Your space
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold bg-linear-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent mt-1">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Manage your Dhoomchhalle account and jump back into planning your journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 text-center text-muted-foreground">
            Loading your profile…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="md:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="bg-linear-to-r from-orange-500/15 via-amber-500/10 to-transparent px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
                  <LayoutDashboard size={22} />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Profile</h2>
                  <p className="text-sm text-muted-foreground">Signed in traveller</p>
                </div>
              </div>
              <ul className="divide-y divide-border">
                <li className="flex items-start gap-3 px-6 py-4">
                  <User className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{user?.name ?? "—"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 px-6 py-4">
                  <Mail className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground break-all">{user?.email ?? "—"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 px-6 py-4">
                  <Phone className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{user?.phone ?? "—"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 px-6 py-4">
                  <Shield className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                    <p className="font-medium text-foreground capitalize">{user?.role ?? "—"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 px-6 py-4">
                  <Calendar className="text-muted-foreground shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Member since</p>
                    <p className="font-medium text-foreground">{formatDate(user?.createdAt)}</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">Quick links</h3>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/hotels"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Hotel size={18} className="text-orange-600" />
                    Browse hotels
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Home size={18} className="text-orange-600" />
                    Home
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-800/90 to-red-700/90 text-white px-4 py-3 text-sm font-semibold shadow-md hover:opacity-95 disabled:opacity-60 transition-opacity"
              >
                <LogOut size={18} />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </motion.div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default UserDashboard;
