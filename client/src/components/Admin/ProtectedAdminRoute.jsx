import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../../services/auth.service";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        setHasToken(Boolean(token));

        if (!token) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const session = await getSession();
        setIsAdmin(session?.data?.user?.role === "admin");
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={hasToken ? "/dashboard" : "/login"} replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
