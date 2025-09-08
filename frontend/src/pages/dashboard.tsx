import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Home, BarChart3, Users, FileText, Calendar, Settings, Bell, LogOut,
  Activity, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Menu, X, ChevronLeft, ChevronRight,
  Search, Download
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://backend.test";

type ServerUser = {
  id: number;
  voornaam: string;
  achternaam: string;
  email: string;
  leeftijd?: number | null;
  bedrijfsnaam?: string | null;
  aantal_werknemers?: number | null;
  kvk_nummer?: string | null;
};

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
};

type Order = { id: string; klant: string; status: "Voltooid" | "Verwerking" | "Geannuleerd"; bedrag: string };

const Dashboard: React.FC = () => {
  const { user, apiFetch, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sidebar & tabs
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("dashboard");

  // Orders (demo + UX)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "klant" | "status" | "bedrag">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Demo data
  const recentOrders: Order[] = [
    { id: "#20251", klant: "Emma Wilson", status: "Voltooid", bedrag: "€149,00" },
    { id: "#20250", klant: "James Miller", status: "Verwerking", bedrag: "€49,00" },
    { id: "#20249", klant: "Sofia Garcia", status: "Geannuleerd", bedrag: "€99,00" },
    { id: "#20248", klant: "Alex Johnson", status: "Voltooid", bedrag: "€299,00" },
  ];

  const notifications = [
    { type: "success", text: "Nieuwe gebruiker geregistreerd" },
    { type: "warning", text: "Hoge server load gedetecteerd (85%)" },
    { type: "success", text: "Dagelijkse backup voltooid" },
  ];

  const navItems: NavItem[] = [
    { key: "dashboard", label: "Overzicht", icon: Home, onClick: () => setActiveKey("dashboard") },
    { key: "analytics", label: "Analytics", icon: BarChart3, onClick: () => setActiveKey("analytics") },
    { key: "orders", label: "Orders", icon: ShoppingCart, onClick: () => setActiveKey("orders") },
    { key: "users", label: "Gebruikers", icon: Users, onClick: () => setActiveKey("users") },
    { key: "docs", label: "Documenten", icon: FileText, onClick: () => setActiveKey("docs") },
    { key: "calendar", label: "Kalender", icon: Calendar, onClick: () => setActiveKey("calendar") },
    { key: "settings", label: "Instellingen", icon: Settings, onClick: () => setActiveKey("settings") },
  ];

  const getBadge = (status: string) => {
    if (status === "Voltooid") return "bg-green-100 text-green-700";
    if (status === "Verwerking") return "bg-yellow-100 text-yellow-700";
    if (status === "Geannuleerd") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/user`);
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
          }
          setError(data?.message || "Kon gebruiker niet ophalen.");
          return;
        }
        setServerUser(data.user);
      } catch {
        setError("Fout bij ophalen van de gebruiker.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE}/api/logout`, { method: "POST" });
    } catch {}
    logout();
    navigate("/login", { replace: true });
  };

  const displayName =
    (serverUser?.voornaam && serverUser?.achternaam
      ? `${serverUser.voornaam} ${serverUser.achternaam}`
      : user?.voornaam && user?.achternaam
      ? `${user.voornaam} ${user.achternaam}`
      : user?.email) || "Gebruiker";

  // Orders filtering & sorting
  const filteredOrders = useMemo(() => {
    const base = recentOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.klant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parseAmount = (s: string) => Number(s.replace(/[€\s.]/g, "").replace(",", "."));

    const sorted = [...base].sort((a, b) => {
      let av: string | number = a[sortBy];
      let bv: string | number = b[sortBy];

      if (sortBy === "bedrag") {
        av = parseAmount(a.bedrag);
        bv = parseAmount(b.bedrag);
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [recentOrders, searchTerm, sortBy, sortDir]);

  const SortHeader = ({
    field,
    label,
  }: {
    field: typeof sortBy;
    label: string;
  }) => (
    <button
      className="flex items-center gap-1 group"
      onClick={() => {
        if (sortBy === field) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setSortBy(field);
          setSortDir("asc");
        }
      }}
      title={`Sorteren op ${label}`}
    >
      <span className="text-left">{label}</span>
      <span
        className={`text-[10px] ${
          sortBy === field ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
        }`}
      >
        {sortBy === field ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Dashboard laden…</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Brand + collapse */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white grid place-items-center text-sm font-bold">
            MA
          </div>
          {!collapsed && <span className="font-semibold text-gray-900">MyApp</span>}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          title={collapsed ? "Uitklappen" : "Inklappen"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => {
                    item.onClick?.();
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center" : "justify-start"
                  } gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-700"}`} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-200 p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 mb-2`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white grid place-items-center text-xs font-semibold">
            {displayName?.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{serverUser?.email || user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={async () => handleLogout()}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          title="Uitloggen"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">Uitloggen</span>}
        </button>
      </div>
    </div>
  );

  // Re-usable UI bits
  const StatCard = ({
    icon,
    iconBg,
    iconText,
    title,
    value,
    trend,
    trendUp,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    iconText: string;
    title: string;
    value: string;
    trend: string;
    trendUp?: boolean;
  }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <div className={`flex items-center gap-1 ${trendUp ? "text-emerald-600" : "text-red-600"} text-sm`}>
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-medium">{trend}</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${value}%` }} />
    </div>
  );

  // Content per tab
  const Overview = () => (
    <>
      {/* Welkom + quick actions */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Welkom terug, {displayName} 👋</h2>
          <p className="text-sm text-gray-500">Hier is je overzicht van vandaag.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm">
            <Download className="w-4 h-4" />
            Exporteren
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-sm">
            <ShoppingCart className="w-4 h-4" />
            Nieuwe order
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          iconText="text-emerald-600"
          title="Totale omzet"
          value="€ 156.432"
          trend="+12.5%"
          trendUp
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          iconText="text-blue-600"
          title="Nieuwe orders"
          value="1.247"
          trend="+5.2%"
          trendUp
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          iconText="text-indigo-600"
          title="Totale gebruikers"
          value="8.926"
          trend="-2.1%"
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          iconText="text-violet-600"
          title="Conversie"
          value="3,24%"
          trend="+0.4%"
          trendUp
        />
      </section>

      {/* Grid: omzetkaart + meldingen + bedrijfsinfo */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        {/* Omzet kaart (placeholder) */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Omzetoverzicht</h3>
            <span className="text-sm text-gray-500">Laatste 12 maanden</span>
          </div>
          <div className="h-64 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center">
            <div className="text-center">
              <Activity className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Chart placeholder</p>
              <p className="text-gray-500 text-sm">
                Wil je een echte chart? Dan kunnen we Recharts of Chart.js toevoegen.
              </p>
            </div>
          </div>
        </div>

        {/* Meldingen */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Meldingen</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {notifications.length} nieuw
            </span>
          </div>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`p-1.5 rounded-full ${n.type === "success" ? "bg-green-100" : "bg-yellow-100"}`}>
                  {n.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm text-gray-800">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bedrijfsinfo + gebruik */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedrijfsinformatie</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Naam:</span> <span className="font-medium text-gray-900">{displayName}</span></p>
            <p><span className="text-gray-500">E-mail:</span> <span className="font-medium text-gray-900">{serverUser?.email || user?.email}</span></p>
            {serverUser?.bedrijfsnaam && (
              <p><span className="text-gray-500">Bedrijf:</span> <span className="font-medium text-gray-900">{serverUser.bedrijfsnaam}</span></p>
            )}
            {typeof serverUser?.aantal_werknemers === "number" && (
              <p><span className="text-gray-500">Werknemers:</span> <span className="font-medium text-gray-900">{serverUser.aantal_werknemers}</span></p>
            )}
            {serverUser?.kvk_nummer && (
              <p><span className="text-gray-500">KVK:</span> <span className="font-medium text-gray-900">{serverUser.kvk_nummer}</span></p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gebruiksoverzicht</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">API calls</span>
                <span className="text-gray-900 font-medium">75%</span>
              </div>
              <ProgressBar value={75} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Opslag</span>
                <span className="text-gray-900 font-medium">42%</span>
              </div>
              <ProgressBar value={42} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Team seats</span>
                <span className="text-gray-900 font-medium">58%</span>
              </div>
              <ProgressBar value={58} />
            </div>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recente orders</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek op order, klant of status…"
                className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm">Alles bekijken</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="id" label="Order" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="klant" label="Klant" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="status" label="Status" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="bedrag" label="Bedrag" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{o.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{o.klant}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{o.bedrag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const Analytics = () => (
    <>
      <section className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
        <span className="text-sm text-gray-500">Laatst bijgewerkt: zojuist</span>
      </section>

      {/* KPI’s */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          iconText="text-emerald-600"
          title="MRR"
          value="€ 12.450"
          trend="+3.1%"
          trendUp
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          iconText="text-indigo-600"
          title="Nieuwe klanten"
          value="214"
          trend="+8.4%"
          trendUp
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          iconText="text-violet-600"
          title="Actieve sessies"
          value="3.142"
          trend="-1.8%"
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          iconText="text-blue-600"
          title="Gem. orderwaarde"
          value="€ 87,10"
          trend="+0.9%"
          trendUp
        />
      </section>

      {/* Simple “heat” grid (zonder extra libs) */}
      <section className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maandactiviteit (12 mnd)</h3>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const v = 20 + (i * 7) % 80; // nep intensiteit
            return (
              <div key={i} className="space-y-2">
                <div
                  className="h-24 w-full rounded-md"
                  style={{ background: `linear-gradient(180deg, rgba(59,130,246,0.${Math.max(2, Math.floor(v/10))}) 0%, rgba(147,197,253,0.2) 100%)` }}
                  title={`Maand ${i + 1}`}
                />
                <p className="text-center text-xs text-gray-500">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );

  const Orders = () => (
    <>
      <section className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek orders…"
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="id" label="Order" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="klant" label="Klant" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="status" label="Status" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <SortHeader field="bedrag" label="Bedrag" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{o.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{o.klant}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{o.bedrag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex">
      {/* Desktop sidebar (onder header) */}
      <aside
        className={`hidden md:block sticky top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile overlay (onder header) */}
      {mobileOpen && (
        <div className="fixed inset-0 top-20 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed md:hidden z-40 left-0 top-20 h-[calc(100vh-5rem)] bg-white border-r border-gray-200 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } w-60`}
      >
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white grid place-items-center text-sm font-bold">
              MA
            </div>
            <span className="font-semibold text-gray-900">MyApp</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3">
          <SidebarContent />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-4 lg:px-6 py-6">
        {/* Mobile: open sidebar button */}
        <div className="md:hidden mb-4">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
            Menu
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tab content */}
        {activeKey === "dashboard" && <Overview />}
        {activeKey === "analytics" && <Analytics />}
        {activeKey === "orders" && <Orders />}

        {/* Placeholder content voor overige tabs */}
        {["users", "docs", "calendar", "settings"].includes(activeKey) && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">{activeKey}</h3>
            <p className="text-gray-600 text-sm mt-2">
              Dit is een placeholder. Wil je hier specifieke functionaliteit? Laat het me weten.
            </p>
          </div>
        )}

        {/* Topbar actions (meldingen + logout) rechtsboven in content */}
        <div className="fixed right-4 bottom-6 md:right-6 md:bottom-8 flex flex-col gap-2">
          <button className="p-3 rounded-full bg-white border border-gray-200 shadow hover:shadow-md" title="Meldingen">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="p-3 rounded-full bg-gray-900 text-white shadow hover:bg-black"
            title="Uitloggen"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
