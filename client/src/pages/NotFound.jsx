import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-linear-to-br from-neutral-950 via-zinc-900 to-neutral-800 font-[7rem] text-white min-h-screen flex items-center justify-center text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.25),transparent_45%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_40%)]" />

      <div>
        <h1 className="md:text-7xl text-4xl tracking-widest">Page Not Found</h1>
        <button
          className="text-white/90 cursor-pointer px-8 mt-8 bg-gray-700/60 p-3 border border-white/80 rounded-md font-bold"
          onClick={()=> navigate("/")}
        >
          Move to home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
