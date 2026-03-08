import React from "react";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import PlacesSection from "../components/common/PlacesSection";
import FoodSection from "../components/common/FoodSection";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-transparent relative">
        <Navbar />
        <HeroSection />
        <PlacesSection />
        <FoodSection />
      </div>
    </>
  );
};

export default Home;
