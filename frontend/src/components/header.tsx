import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export function Brand() {
  return <Link to="/" className="brand" aria-label="Numico home"><span className="brand-icon">n<span>·</span></span>numico<span className="brand-period">.</span></Link>;
}
export default function Header() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, logout, apiFetch } = useAuth();
  const navigate = useNavigate();
  async function signOut() {
    setBusy(true);
    try { await apiFetch(`${import.meta.env.VITE_API_BASE_URL || "https://backend.test"}/api/logout`, { method: "POST" }); }
    catch { /* Local sign-out remains available offline. */ }
    finally { logout(); setBusy(false); setOpen(false); navigate("/login"); }
  }
  return <header className="site-header"><div className="container header-inner"><Brand />
    <button className="menu-toggle" aria-label={open ? "Menu sluiten" : "Menu openen"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Hoofdnavigatie" onClick={() => setOpen(false)} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } }}>
      <Link to="/#features">Mogelijkheden</Link><Link to="/#how-it-works">Zo werkt het</Link><NavLink to="/pricing">Prijzen</NavLink><span className="nav-divider" />
      {user ? <><Link to="/dashboard" className="button button-small">Mijn dashboard <ArrowUpRight size={16} /></Link><button className="nav-logout" disabled={busy} onClick={() => void signOut()}>Uitloggen</button></> : <><NavLink to="/login">Inloggen</NavLink><Link to="/register" className="button button-small">Aan de slag <ArrowUpRight size={16} /></Link></>}
    </nav>
  </div></header>;
}
