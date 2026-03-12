import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };
  return (
    <div className="bg-gray-900 font-[7rem] text-white min-h-screen flex items-center justify-center text-center">
      <div>
        <h1>Page Not Found</h1>
        <button
          className="text-red-800 mt-5 bg-gray-700/60 p-3 rounded-md font-bold"
          onClick={handleClick}
        >
          Move to home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
