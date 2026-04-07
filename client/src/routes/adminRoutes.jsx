import React from "react";
import { Route, Navigate } from "react-router-dom";
import AdminRouteShell from "../components/Admin/AdminRouteShell";
import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminReviews from "../pages/AdminReviews";
import AdminReports from "../pages/AdminReports";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminSettings from "../pages/AdminSettings";
import AdminHotels from "../pages/AdminHotels";
import AddHotelForm from "../components/Admin/AddHotelForm";


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
