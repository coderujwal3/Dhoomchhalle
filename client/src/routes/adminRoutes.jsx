import React, { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import AdminRouteShell from "../components/Admin/AdminRouteShell";

const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const AdminReviews = lazy(() => import("../pages/AdminReviews"));
const AdminReports = lazy(() => import("../pages/AdminReports"));
const AdminAnalytics = lazy(() => import("../pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("../pages/AdminSettings"));
const AdminHotels = lazy(() => import("../pages/AdminHotels"));
const AddHotelForm = lazy(() => import("../components/Admin/AddHotelForm"));


export const adminRoutes = (
  <Route path="/admin" element={<AdminRouteShell />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="reviews" element={<AdminReviews />} />
    <Route path="reports" element={<AdminReports />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="settings" element={<AdminSettings />} />
    <Route path="hotels" element={<AdminHotels />} />
    <Route path="addhotelform" element={<AddHotelForm />} />
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Route>
);

export default adminRoutes;
