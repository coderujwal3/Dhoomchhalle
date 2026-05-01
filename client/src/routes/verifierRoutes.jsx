import React, { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import VerifierRouteShell from "../components/Verifier/VerifierRouteShell";

const VerifierDashboard = lazy(() => import("../pages/VerifierDashboard"));
const VerifierReviewsList = lazy(() => import("../pages/VerifierReviewsList"));

export const verifierRoutes = (
  <Route path="/verifier" element={<VerifierRouteShell />}>
    <Route index element={<VerifierDashboard />} />
    <Route
      path="reviews/pending"
      element={<VerifierReviewsList filterStatus="pending" />}
    />
    <Route
      path="reviews/approved"
      element={<VerifierReviewsList filterStatus="approved" />}
    />
    <Route
      path="reviews/rejected"
      element={<VerifierReviewsList filterStatus="rejected" />}
    />
    <Route path="*" element={<Navigate to="/verifier" replace />} />
  </Route>
);

export default verifierRoutes;
