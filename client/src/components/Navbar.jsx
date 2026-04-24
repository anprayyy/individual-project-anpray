import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold tracking-wide">
          CV Builder 🚀
        </Link>

        <Link to="/" className="hover:text-slate-300 transition">
          Dashboard
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </nav>
  );
}
