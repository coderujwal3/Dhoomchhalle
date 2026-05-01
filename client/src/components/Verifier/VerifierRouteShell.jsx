import React from "react";
import { Outlet } from "react-router-dom";
import VerifierLayout from "./VerifierLayout";
import ProtectedVerifierRoute from "../auth/ProtectedVerifierRoute";

function VerifierRouteShell() {
  return (
    <ProtectedVerifierRoute>
      <VerifierLayout>
        <Outlet />
      </VerifierLayout>
    </ProtectedVerifierRoute>
  );
}

export default VerifierRouteShell;
