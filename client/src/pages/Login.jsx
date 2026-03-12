import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// const location = useLocation();
// console.log(location.state?.message);
function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email, password);
    setEmail("");
    setPassword("");
    
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setMessage("Logged In Successfully");
      navigate("/");
    } catch (error) {
      setMessage(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-14">
      <form
        onSubmit={handleSubmit}
        className="w-75 p-8 border rounded-xl border-gray-300 bg-gray-100 shadow-gray-200 shadow-md"
      >
        <h2>Register in Dhoomchhalle</h2>

        <input
          className="w-full p-2 mt-2 mb-2 border-2 rounded-md border-red-800 focus:shadow-[0px_0px_5px_red] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          type="email"
          required
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mt-2 mb-2 border-2 rounded-md border-red-800 focus:shadow-[0px_0px_5px_red] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full p-2 bg-[#007bff] text-white border-none"
          type="submit"
        >
          Register
        </button>

        <p>{message}</p>
      </form>
    </div>
  );
}

export default Register;