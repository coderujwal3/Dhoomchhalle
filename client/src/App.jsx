import React, { useEffect, Suspense } from "react";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { getSession } from "./services/auth.service";

function App() {
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getSession().catch(() => {});
  }, []);
  
  return (
    <>
        <AppRoutes />
    </>
  );
}

export default App;
