import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchOAuthToken } from "../store/slices/authSlice";
import { showToast } from "../utils/toast";

export default function OAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchOAuthToken())
      .unwrap()
      .then(() => {
        navigate("/", { replace: true });
      })
      .catch((err) => {
        showToast(err || "Login gagal, coba lagi", "error");
        navigate("/login", { replace: true });
      });
  }, [dispatch, navigate]);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-white/70 text-sm">Menyelesaikan proses login...</p>
      </div>
    </div>
  );
}