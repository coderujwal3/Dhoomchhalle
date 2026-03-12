import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name, email, phone, password);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    
    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", {
        name,
        email,
        password,
        phone,
      });
      localStorage.setItem("token", res.data.token);
      setMessage("Registered Successfully, Kindly Login to continue...");
    } catch (error) {
      setMessage(error.response.data.message);
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
          className="w-full p-2 mt-2 mb-2"
          required
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 mt-2 mb-2"
          type="email"
          required
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mt-2 mb-2"
          required
          type="number"
          placeholder="Enter Your Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full p-2 mt-2 mb-2"
          required
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full p-2 bg-[#007bff] text-white border-none" type="submit">
          Register
        </button>

        <p>{message}</p>
      </form>
    </div>
  );
}

export default Register;