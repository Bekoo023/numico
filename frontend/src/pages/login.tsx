import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://backend.test";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Inloggen mislukt. Controleer je gegevens.");
        return;
      }

      login(data.user, data.token);
      navigate("/dashboard");
    } catch {
      setError("Kon geen verbinding maken met de server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen px-2 py-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 -right-28 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-28 -left-28 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow p-6 md:p-8 space-y-5 animate-in slide-in-from-bottom duration-300">
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Inloggen
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">Welkom! Vul je gegevens in om verder te gaan.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 backdrop-blur-sm text-xs text-red-300 flex items-center space-x-2">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-1">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                name="email"
                type="email"
                placeholder="E-mailadres"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                placeholder="Wachtwoord"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Bezig met inloggen...
                </>
              ) : (
                <>Inloggen</>
              )}
            </button>
          </form>

          <div className="text-center text-xs">
            <p className="text-slate-400">
              Nog geen account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-cyan-400 hover:text-cyan-300 transition font-semibold cursor-pointer"
              >
                Registreer hier
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
