import React from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

function AdminRouteShell() {
  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedAdminRoute>
  );
}

export default AdminRouteShell;
