import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Haal CSRF cookie op
      await fetch("http://backend.test/sanctum/csrf-cookie", {
        credentials: "include",
      });

      // Login request
      const res = await fetch("http://backend.test/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Inloggen mislukt. Controleer je gegevens.");
      } else {
        const data = await res.json();
        // Sla user data op in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        
        // Redirect naar dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Kon geen verbinding maken met de server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">
          Inloggen
        </h2>

        {error && (
          <div className="text-red-400 bg-red-800/20 border border-red-500 rounded-md px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="E-mailadres"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />

          <input
            name="password"
            type="password"
            placeholder="Wachtwoord"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-slate-400">
            Nog geen account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              Registreer hier
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;