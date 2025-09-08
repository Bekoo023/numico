import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ⬅️ fix importpad

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://backend.test";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, apiFetch } = useAuth();       // ⬅️ apiFetch gebruiken
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE}/api/logout`, { method: "POST" });
    } catch {}
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-md bg-slate-900/90 border-b border-slate-700/50 shadow-2xl"
          : "backdrop-blur-sm bg-transparent border-b border-white/10"
      }`}
    >
      <div className="h-full max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <img src="logo.png" alt="logo" className="rounded-xl w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Numico
          </h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/pricing" className="text-slate-300 hover:text-cyan-400 transition-colors duration-200">
            Prijzen
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-cyan-400 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Inloggen
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5"
              >
                Registreer
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="text-cyan-400 hover:text-blue-400 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Uitloggen
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
