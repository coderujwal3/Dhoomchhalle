import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../../services/auth.service";

const ProtectedVerifierRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerifierStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        setHasToken(Boolean(token));

        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const session = await getSession();
        const userRole = session?.data?.user?.role;
        // Allow both admin and verifier roles
        setIsAuthorized(userRole === "admin" || userRole === "verifier");
      } catch (error) {
        console.error("Verifier check failed:", error);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkVerifierStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to={hasToken ? "/dashboard" : "/login"} replace />;
  }

  return children;
};

export default ProtectedVerifierRoute;
