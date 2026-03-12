import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import SmoothScroll from "../components/common/SmoothScroll";
import TextCursor from "../components/common/TextCursor";

const MainLayout = () => {
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