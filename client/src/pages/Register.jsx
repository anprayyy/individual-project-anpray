import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { url } from "../constants/url";
import { showToast } from "../utils/toast";

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

      showToast("Register berhasil, silakan login");
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Register failed";
      showToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-amber-400/20 blur-[140px]" />
      <div className="absolute top-6 right-0 h-80 w-80 rounded-full bg-rose-400/25 blur-[160px]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-[150px]" />

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <div className="bg-white/95 text-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-900/30 border border-white/40 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Start here
                </p>
                <h2 className="text-2xl font-display text-slate-900">
                  Buat akun baru
                </h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-xl">
                ✦
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Sekali daftar, kamu bisa simpan banyak versi CV.
            </p>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Full name
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                  placeholder="Nama lengkap"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                  placeholder="you@studio.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold transition hover:bg-slate-800"
              >
                Register
              </button>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              Sudah punya akun?{" "}
              <span
                className="text-slate-900 font-semibold cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              CV Launch
            </div>
            <h1 className="text-4xl md:text-5xl font-display leading-tight">
              Mulai membuat CV yang terasa premium.
            </h1>
            <p className="text-base text-white/70 max-w-xl">
              Buat profil profesional dengan layout modern, ringkas, dan mudah
              di-scan oleh recruiter.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Template elegan dan fokus",
                "Auto save & versi",
                "Highlight skill penting",
                "Siap dibagikan kapan saja",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
