import React from "react";
/** Public landing page (no auth required). */
import HeroSection from "../components/common/HeroSection";
import PlacesSection from "../components/common/PlacesSection";
import FoodSection from "../components/common/FoodSection";
import TransportSection from "../components/common/TransportSection";
import GuidesSection from "../components/common/GuidesSection";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-transparent relative">
        <HeroSection />
        <PlacesSection />
        <FoodSection />
        <TransportSection />
        <GuidesSection />
      </div>
    </>
  );
};

export default Home;
