import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { url } from "../constants/url";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${url}/auth/login`, form);

      localStorage.setItem("access_token", data.access_token);

      navigate("/");
    } catch (error) {
      console.log(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">CV Builder 🚀</h1>
        <p className="text-lg text-center max-w-md opacity-90">
          Buat CV profesional dalam hitungan menit. Tampilkan pengalaman
          terbaikmu dan download siap kirim ke HR.
        </p>

        <div className="mt-8">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="w-48 opacity-90"
          />
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2">
            Welcome Back 👋
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Login untuk lanjut membuat CV kamu
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = `${url}/auth/github`)}
              className="border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition font-semibold text-slate-700"
            >
              Login with GitHub
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm mt-6 text-gray-600">
            Belum punya akun?{" "}
            <span
              className="text-blue-600 cursor-pointer font-medium"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
