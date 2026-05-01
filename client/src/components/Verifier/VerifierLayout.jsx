import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  XCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { logout } from "../../services/auth.service";

const VerifierLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/verifier",
      icon: LayoutDashboard,
      delay: 0.1,
    },
    {
      label: "Pending Reviews",
      path: "/verifier/reviews/pending",
      icon: MessageSquare,
      delay: 0.16,
    },
    {
      label: "Approved",
      path: "/verifier/reviews/approved",
      icon: CheckCircle2,
      delay: 0.22,
    },
    {
      label: "Rejected",
      path: "/verifier/reviews/rejected",
      icon: XCircle,
      delay: 0.28,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Verifier logout failed:", error);
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col fixed h-screen z-40`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div
            className={`${!sidebarOpen && "hidden"} flex items-center gap-2`}
          >
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-bold">Verifier</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 cursor-pointer" />
            ) : (
              <Menu className="w-5 h-5 cursor-pointer" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay, duration: 0.3 }}
              >
                <Link to={item.path}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`${!sidebarOpen && "hidden"}`}>
                      {item.label}
                    </span>
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className={`${!sidebarOpen && "hidden"}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 flex flex-col`}
      >
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <h1 className="text-white text-xl font-semibold">
            Content Moderator
          </h1>
          <div className="text-slate-400 text-sm">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-6 bg-slate-900"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default VerifierLayout;
