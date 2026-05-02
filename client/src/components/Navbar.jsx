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
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-lg sm:text-xl font-bold tracking-wide">
            CV Studio 🚀
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
      </div>
    </nav>
  );
}
