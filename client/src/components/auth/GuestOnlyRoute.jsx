import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const GuestOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default GuestOnlyRoute;
