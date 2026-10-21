import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Building2, CalendarDays, FileText, LayoutDashboard, LogOut, MessageCircle, RefreshCw, ShieldCheck, UserRound, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Administration from "../components/administration/Administration";
import { API_BASE } from "../components/administration/api";
import "./dashboard.css";

type Profile = { id: number; voornaam: string; achternaam: string; email: string; bedrijfsnaam?: string | null; kvk_nummer?: string | null; aantal_werknemers?: number | null };

export default function Dashboard() {
  const { user, apiFetch, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [active, setActive] = useState(window.location.hash || "#dashboard-content");
  useEffect(() => {
    const onHash = () => setActive(window.location.hash || "#dashboard-content");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    void apiFetch(`${API_BASE}/api/user`, { signal: controller.signal }).then(async response => {
      if (response.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      if (!response.ok) throw new Error("profile");
      const data = await response.json();
      if (!data.user || typeof data.user.id !== "number") throw new Error("profile");
      if (!controller.signal.aborted) { setProfile(data.user); setUser(data.user); }
    }).catch(() => { if (!controller.signal.aborted) setError("Je accountgegevens konden niet worden opgehaald."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [apiFetch, logout, navigate, setUser, refresh]);
  async function handleLogout() {
    setLoggingOut(true);
    try { await apiFetch(`${API_BASE}/api/logout`, { method: "POST" }); }
    finally { logout(); navigate("/login", { replace: true }); }
  }
  const name = [profile?.voornaam || user?.voornaam, profile?.achternaam || user?.achternaam].filter(Boolean).join(" ") || "Gebruiker";
  const initials = name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
  const navigation = [
    { href: "#dashboard-content", label: "Overzicht", icon: LayoutDashboard },
    { href: "#upload", label: "Bonnetje uploaden", icon: Upload },
    { href: "#receipts", label: "Mijn bonnetjes", icon: FileText },
    { href: "#assistant", label: "AI-assistent", icon: MessageCircle },
    { href: "#account", label: "Mijn account", icon: UserRound },
  ];
  return <div className="dashboard-shell">
    <a className="dash-skip" href="#dashboard-content">Naar dashboard</a>
    <aside className="dash-sidebar" aria-label="Dashboard navigatie">
      <Link to="/" className="dash-brand"><span className="dash-brand-symbol">n<span>•</span></span>numico<span className="dash-brand-dot">.</span></Link>
      <div className="dash-workspace"><span className="dash-workspace-icon"><Building2 size={19} /></span><div><strong>{profile?.bedrijfsnaam || "Mijn werkruimte"}</strong><span>Jouw administratie</span></div></div>
      <p className="dash-nav-label">WERKRUIMTE</p>
      <nav className="dash-nav">{navigation.map(({ href, label, icon: Icon }) => <a key={href} href={href} className={active === href ? "is-active" : ""} aria-current={active === href ? "location" : undefined}><Icon size={19} />{label}{active === href && <span className="dash-nav-indicator" />}</a>)}</nav>
      <div className="dash-sidebar-bottom"><div className="dash-note"><ShieldCheck size={23} /><strong>Van losse bonnen naar helder inzicht.</strong><p>Upload, controleer en stel je vragen. Je administratie op één plek.</p><a href="#assistant">Vraag het je assistent <ArrowUpRight size={15} /></a></div><div className="dash-sidebar-user"><span className="dash-avatar">{initials}</span><div><strong>{name}</strong><span>{profile?.email || user?.email}</span></div><button aria-label="Uitloggen" title="Uitloggen" disabled={loggingOut} onClick={() => void handleLogout().catch(() => undefined)}><LogOut size={18} /></button></div></div>
    </aside>
    <main className="dash-main" id="dashboard-content">
      <header className="dash-topbar"><div><span className="dash-breadcrumb">Werkruimte</span><span className="dash-slash">/</span><strong>Administratie</strong></div><div className="dash-topbar-right"><span className="dash-date"><CalendarDays size={15} />{new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span><span className="dash-avatar dash-avatar-light" title={name}>{initials}</span></div></header>
      <div className="dash-content">
        <section className="dash-heading"><div><p className="dash-eyebrow"><span /> MINDER PAPIERWERK. MEER OVERZICHT.</p><h1>Welkom terug, {profile?.voornaam || user?.voornaam || "ondernemer"}<span>.</span></h1><p>Je bonnetjes, je cijfers en een assistent die met je meedenkt.</p></div><button className="dash-button" onClick={() => setRefresh(value => value + 1)} disabled={loading}><RefreshCw size={16} className={loading ? "dash-spin" : ""} />Vernieuwen</button></section>
        {error && <p className="admin-warning" role="alert">{error}</p>}
        <Administration refresh={refresh} />
        <section className="dash-card dash-account" id="account"><div className="dash-section-heading"><h2>Mijn account</h2><span className="dash-tag">{profile?.bedrijfsnaam || "Persoonlijk account"}</span></div><dl className="dash-company-details"><div><dt>Naam</dt><dd>{name}</dd></div><div><dt>E-mailadres</dt><dd>{profile?.email || user?.email}</dd></div><div><dt>Bedrijfsnaam</dt><dd>{profile?.bedrijfsnaam || "Niet ingevuld"}</dd></div><div><dt>KVK-nummer</dt><dd>{profile?.kvk_nummer || "Niet ingevuld"}</dd></div></dl></section>
        <footer className="dash-footer"><span>Een heldere administratie. Een betere werkdag.</span><span>Numico werkruimte</span></footer>
      </div>
    </main>
  </div>;
}
