import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Building2, CalendarDays, FileText, LayoutDashboard, LogOut, Menu, MessageCircle, RefreshCw, UserRound, Upload, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Administration from "../components/administration/Administration";
import AdministrationChat from "../components/administration/AdministrationChat";
import { API_BASE } from "../components/administration/api";
import "./dashboard.css";
import "./dashboard-premium.css";
import "./dashboard-pages.css";
const ThreeScene = lazy(() => import("../assets/ThreeScene"));

type Profile = { id: number; voornaam: string; achternaam: string; email: string; bedrijfsnaam?: string | null; kvk_nummer?: string | null; aantal_werknemers?: number | null };
type DashboardContext = { refresh: number; profile: Profile | null; name: string; email: string; loggingOut: boolean; signOut: () => Promise<void> };
const navigation = [
  { to: "/dashboard", label: "Overzicht", icon: LayoutDashboard },
  { to: "/dashboard/upload", label: "Uploaden", icon: Upload },
  { to: "/dashboard/bonnetjes", label: "Bonnetjes", icon: FileText },
  { to: "/dashboard/assistent", label: "AI-assistent", icon: MessageCircle },
  { to: "/dashboard/account", label: "Mijn account", icon: UserRound },
];

export default function Dashboard() {
  const { user, apiFetch, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const title = navigation.find(item => item.to === pathname.replace(/\/$/, ""))?.label || "Pagina niet gevonden";

  useEffect(() => {
    setMenuOpen(false);
    main.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    document.title = title + " | Numico";
  }, [pathname, title]);

  // Keep old bookmarks to dashboard sections working.
  useEffect(() => {
    const routes: Record<string, string> = { "#upload": "upload", "#receipts": "bonnetjes", "#assistant": "assistent", "#account": "account" };
    if (routes[hash]) navigate("/dashboard/" + routes[hash], { replace: true });
  }, [hash, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    void apiFetch(API_BASE + "/api/user", { signal: controller.signal }).then(async response => {
      if (response.status === 401) { logout(); navigate("/login", { replace: true }); return; }
      if (!response.ok) throw new Error("profile");
      const data = await response.json();
      if (!data.user || typeof data.user.id !== "number") throw new Error("profile");
      if (!controller.signal.aborted) { setProfile(data.user); setUser(data.user); }
    }).catch(() => { if (!controller.signal.aborted) setError("Accountgegevens niet beschikbaar."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [apiFetch, logout, navigate, setUser, refresh]);

  async function signOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    // Local sign-out must also work when the server is slow or unavailable.
    logout();
    navigate("/login", { replace: true });
    try { await apiFetch(API_BASE + "/api/logout", { method: "POST", signal: AbortSignal.timeout(5000) }); }
    catch { /* The local session is already cleared. */ }
  }
  const name = [profile?.voornaam || user?.voornaam, profile?.achternaam || user?.achternaam].filter(Boolean).join(" ") || "Gebruiker";
  const email = profile?.email || user?.email || "";
  const initials = name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
  return <div className="dashboard-shell dashboard-premium dashboard-pages">
    <div className="dash-atmosphere" aria-hidden="true"><Suspense fallback={null}><ThreeScene /></Suspense></div>
    <a className="dash-skip" href="#dashboard-content">Naar inhoud</a>
    <header className="dash-mobile-header"><Link to="/" className="dash-brand">numico<span className="dash-brand-dot">.</span></Link><button ref={menuButton} className="dash-button" aria-label={menuOpen ? "Menu sluiten" : "Menu openen"} aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></header>
    <aside id="dashboard-sidebar" className={"dash-sidebar" + (menuOpen ? " is-open" : "")} aria-label="Dashboard navigatie" onKeyDown={event => { if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); } }}>
      <Link to="/" className="dash-brand"><span className="dash-brand-symbol">n<span>·</span></span>numico<span className="dash-brand-dot">.</span></Link>
      <div className="dash-sidebar-scroll" tabIndex={0} aria-label="Scrollbare navigatie">
        <div className="dash-workspace"><span className="dash-workspace-icon"><Building2 size={19} /></span><div><strong>{profile?.bedrijfsnaam || "Mijn werkruimte"}</strong><span>Administratie</span></div></div>
        <nav className="dash-nav" aria-label="Werkruimte">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end className={({ isActive }) => isActive ? "is-active" : ""} onClick={() => setMenuOpen(false)}><Icon size={19} />{label}</NavLink>)}</nav>
      </div>
      <div className="dash-sidebar-bottom"><div className="dash-sidebar-user"><span className="dash-avatar">{initials}</span><div><strong>{name}</strong><span>{email}</span></div></div><button className="dash-logout" disabled={loggingOut} onClick={() => void signOut()}><LogOut size={17} />{loggingOut ? "Uitloggen…" : "Uitloggen"}</button></div>
    </aside>
    <main className="dash-main" id="dashboard-content" tabIndex={-1} ref={main}>
      <header className="dash-topbar"><div><span className="dash-breadcrumb">Werkruimte</span><span className="dash-slash">/</span><strong>{title}</strong></div><span className="dash-date"><CalendarDays size={15} />{new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span></header>
      <div className="dash-content">
        <section className="dash-heading"><h1>{title}</h1><div className="dash-heading-actions">{!pathname.endsWith("/upload") && <Link to="/dashboard/upload" className="dash-button admin-primary"><Upload size={16} />Nieuwe bon</Link>}<button className="dash-button" onClick={() => setRefresh(value => value + 1)} disabled={loading} aria-label="Vernieuwen"><RefreshCw size={16} className={loading ? "dash-spin" : ""} /><span>Vernieuwen</span></button></div></section>
        {error && <p className="admin-warning" role="alert">{error} <button onClick={() => setRefresh(value => value + 1)}>Opnieuw proberen</button></p>}
        <Outlet context={{ refresh, profile, name, email, loggingOut, signOut } satisfies DashboardContext} />
      </div>
    </main>
  </div>;
}

export function DashboardAdministration({ view }: { view: "overview" | "upload" | "receipts" }) {
  const { refresh } = useOutletContext<DashboardContext>();
  return <div className={"dash-page dash-page-" + view}><Administration key={view} refresh={refresh} view={view} /></div>;
}

export function DashboardAssistant() {
  const { refresh } = useOutletContext<DashboardContext>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const invalid = Boolean(from && to && from > to);
  return <div className="dash-page dash-page-assistant">
    <div className="admin-period"><span className="dash-eyebrow">PERIODE</span><div className="admin-period-fields"><label>Van<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>Tot en met<input type="date" min={from || undefined} value={to} onChange={e => setTo(e.target.value)} /></label>{(from || to) && <button className="dash-button" onClick={() => { setFrom(""); setTo(""); }}>Alles</button>}</div></div>
    {invalid && <p className="admin-warning" role="alert">Kies een einddatum op of na de begindatum.</p>}
    <AdministrationChat key={refresh} from={from} to={to} revision={0} invalidPeriod={invalid} />
  </div>;
}

export function DashboardAccount() {
  const { profile, name, email, loggingOut, signOut } = useOutletContext<DashboardContext>();
  return <section className="dash-card dash-account dash-page" id="account"><h2>Accountgegevens</h2><dl className="dash-company-details"><div><dt>Naam</dt><dd>{name}</dd></div><div><dt>E-mailadres</dt><dd>{email}</dd></div><div><dt>Bedrijfsnaam</dt><dd>{profile?.bedrijfsnaam || "Niet ingevuld"}</dd></div><div><dt>KVK-nummer</dt><dd>{profile?.kvk_nummer || "Niet ingevuld"}</dd></div></dl><button className="dash-button dash-account-logout" disabled={loggingOut} onClick={() => void signOut()}><LogOut size={16} />Uitloggen</button></section>;
}
