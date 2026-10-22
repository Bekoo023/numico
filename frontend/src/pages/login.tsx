import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthIntro from "../components/AuthIntro";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://backend.test";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }) });
      const data = await res.json();
      if (!res.ok) { setError(data?.message || "Inloggen mislukt. Controleer je gegevens."); return; }
      if (!data.user || !data.token) { setError("Inloggen is niet gelukt. Probeer het opnieuw."); return; }
      login(data.user, data.token);
      const destination = location.state?.from?.pathname;
      navigate(typeof destination === "string" && (destination === "/dashboard" || destination.startsWith("/dashboard/")) ? destination : "/dashboard", { replace: true });
    } catch { setError("Kon geen verbinding maken met de server. Probeer het opnieuw."); }
    finally { setLoading(false); }
  }
  return <section className="auth-page container"><AuthIntro /><div className="auth-card"><h2>Welkom terug</h2><p>Log in op je Numico-werkruimte.</p><form onSubmit={handleSubmit} className="auth-form" aria-busy={loading}>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <label htmlFor="email">E-mailadres<input id="email" name="email" type="email" autoComplete="email" placeholder="jij@jouwbedrijf.nl" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
    <div><label htmlFor="password">Wachtwoord</label><div className="password-field"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" placeholder="Je wachtwoord" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" aria-label={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
    <button type="submit" className="button" disabled={loading}>{loading ? "Bezig met inloggen…" : "Inloggen"}<ArrowRight size={17} /></button>
  </form><div className="auth-bottom">Nog geen account? <Link to="/register">Maak een account aan</Link></div></div></section>;
}
