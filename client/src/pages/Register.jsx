import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { url } from "../constants/url";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${url}/auth/register`, form);

      navigate("/login");
    } catch (error) {
      console.log(error.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">Join CV Builder ✨</h1>
        <p className="text-lg text-center max-w-md opacity-90">
          Mulai perjalanan karirmu dengan CV profesional. Buat, edit, dan
          download CV dengan mudah.
        </p>

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          className="w-48 mt-8 opacity-90"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2">
            Create Account 🚀
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Daftar untuk mulai membuat CV kamu
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* NAME */}
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full border p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Register
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Sudah punya akun?{" "}
            <span
              className="text-blue-600 cursor-pointer font-medium"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
