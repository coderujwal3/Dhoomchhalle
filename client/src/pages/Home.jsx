import React from "react";
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/common/HeroSection";
import PlacesSection from "../components/common/PlacesSection";
import FoodSection from "../components/common/FoodSection";
import TransportSection from "../components/common/TransportSection";
import GuidesSection from "../components/common/GuidesSection";
import Footer from "../components/common/Footer";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

const Home = () => {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <ClimbingBoxLoader color="#36d7b7" size={15} />
      </div>
    );
  }
  return (
    <>
      <div className="min-h-screen bg-transparent relative">
        <Navbar />
        <HeroSection />
        <PlacesSection />
        <FoodSection />
        <TransportSection />
        <GuidesSection />
        <Footer />
      </div>
    </>
  );
};

export default Home;
