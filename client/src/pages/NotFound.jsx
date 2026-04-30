import react, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import EvilEye from "../components/common/ui/EvilEye";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-transparent font-[7rem] text-white min-h-screen overflow-hidden bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 px-4 py-20">
      <Suspense fallback={<div className="absolute inset-0" />}>
        <EvilEye
          eyeColor="#FF6F37"
          intensity={1.5}
          pupilSize={0.6}
          irisWidth={0.25}
          glowIntensity={0.35}
          scale={0.8}
          noiseScale={1}
          pupilFollow={1}
          flameSpeed={1}
          backgroundColor="#120F17"
        />
      </Suspense>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.2),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.2),transparent_40%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 className="md:text-7xl text-4xl tracking-widest">Page Not Found</h1>
        <button
          className="text-white/90 cursor-pointer px-8 mt-8 bg-gray-700/60 p-3 border border-white/80 rounded-md font-bold"
          onClick={() => navigate("/")}
        >
          Move to home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
