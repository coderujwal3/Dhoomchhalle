import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import SmoothScroll from "../components/common/ui/SmoothScroll";
import TextCursor from "../components/common/ui/TextCursor";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const MainLayout = () => {
  const { pathname } = useLocation();
  const showCursorEffect = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">

      {/* Speed Insight Vercel */}
      <SpeedInsights />
      <Analytics />

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="grow">
        <SmoothScroll>
          {showCursorEffect ? <TextCursor /> : null}
          <Outlet />
        </SmoothScroll>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;