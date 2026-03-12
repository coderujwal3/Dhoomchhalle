import {React, useState, useEffect} from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import SmoothScroll from "../components/common/SmoothScroll";
import TextCursor from "../components/common/TextCursor";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

const MainLayout = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <ClimbingBoxLoader
          color="#36d7b7"
          size={15}
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="grow">
        <SmoothScroll>
          <TextCursor />
          <Outlet />
        </SmoothScroll>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;