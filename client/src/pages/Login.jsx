import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  googleLoginUser,
  clearError,
  setTokenFromUrl,
} from "../store/slices/authSlice";
import { url } from "../constants/url";
import { showToast } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Handle token dari URL (OAuth redirect, e.g. GitHub)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      dispatch(setTokenFromUrl(token));
      navigate("/", { replace: true });
    }
  }, [navigate, dispatch]);

  // Redirect kalau sudah login
  const token = useSelector((state) => state.auth.token);
  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  // Bersihkan error saat unmount
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error]);

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(googleLoginUser(credentialResponse.credential));
  };

  const handleGoogleError = () => {
    showToast("Google login gagal", "error");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-emerald-400/30 blur-[140px]" />
      <div className="absolute top-10 -right-16 h-80 w-80 rounded-full bg-sky-400/30 blur-[160px]" />
      <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-[150px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              CV Studio
            </div>
            <h1 className="text-4xl md:text-5xl font-display leading-tight">
              Masuk dan lanjutkan cerita kariermu.
            </h1>
            <p className="text-base text-white/70 max-w-xl lg:mx-0 mx-auto">
              Bangun CV yang terasa personal, modern, dan siap kirim. Simpan
              semua versi, edit cepat, dan langsung unduh PDF.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Layout rapi untuk recruiter",
                "AI Review & highlight otomatis",
                "Ekspor PDF instan",
                "Aman di semua device",
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

          <div className="bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/30 border border-white/40 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Welcome back
                </p>
                <h2 className="text-2xl font-display text-slate-900">
                  Login ke CV Studio
                </h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl">
                ↗
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3">
              Gunakan email yang terdaftar agar datamu sinkron.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => (window.location.href = `${url}/auth/github`)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Login with GitHub
                </button>

                <div className="flex justify-center overflow-hidden">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    width={320}
                  />
                </div>
              </div>
            </form>

            <p className="text-sm text-slate-500 mt-6 text-center">
              Belum punya akun?{" "}
              <span
                className="text-slate-900 font-semibold cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
