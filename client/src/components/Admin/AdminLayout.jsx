import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  HotelIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { logout } from "../../services/auth.service";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard, delay: 0.1 },
    { label: "Users", path: "/admin/users", icon: Users, delay: 0.16 },
    {
      label: "Reviews",
      path: "/admin/reviews",
      icon: MessageSquare,
      delay: 0.22,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: AlertCircle,
      delay: 0.28,
    },
    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
      delay: 0.34,
    },
    { label: "Hotels", path: "/admin/hotels", icon: HotelIcon, delay: 0.4 },
    { label: "Settings", path: "/admin/settings", icon: Settings, delay: 0.46 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Admin logout failed:", error);
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
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">DC</span>
            </div>
            <span className="text-white font-bold">Admin</span>
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
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: item.delay, duration: 0.4 }}
                key={item.label}
                className="relative"
              >
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={`${!sidebarOpen && "hidden"} font-medium`}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition"
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`${!sidebarOpen && "hidden"} font-medium`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 overflow-auto transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition lg:hidden"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="text-slate-300 text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
