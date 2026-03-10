import React from "react";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import PlacesSection from "../components/common/PlacesSection";
import FoodSection from "../components/common/FoodSection";
import TransportSection from "../components/common/TransportSection";
import GuidesSection from "../components/common/GuidesSection";
import Footer from "../components/common/Footer";
import ScrollVelocity from "../components/common/ScrollVelocity";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-transparent relative">
        <Navbar />
        <HeroSection />
        <PlacesSection />
        <ScrollVelocity
          texts={["Delicious Food,", "Save your Flavours,"]}
          velocity={100}
          className="custom-scroll-text"
        />
        <FoodSection />
        <ScrollVelocity
          texts={["Explore Varanasi,", "Your Travel Companion,"]}
          velocity={100}
          className="custom-scroll-text"
        />
        <TransportSection />
        <GuidesSection />
        <Footer />
      </div>
    </>
  );
};

export default Home;
