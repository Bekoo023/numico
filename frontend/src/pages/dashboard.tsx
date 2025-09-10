import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Settings,
  Bell,
  LogOut,
  Activity,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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

type Order = {
  id: string;
  klant: string;
  status: "Voltooid" | "Verwerking" | "Geannuleerd";
  bedrag: string;
};

// ------- utils -------
const clsx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
const formatCurrency = (n: number) =>
  n.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const parseEuro = (s: string) => Number(s.replace(/[^\d,\-]/g, "").replace(",", "."));

const useLocalStorage = <T,>(key: string, initial: T) => {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal] as const;
};

// Skeleton loader
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={clsx("animate-pulse rounded-md bg-gray-200/60 dark:bg-gray-700/50", className)} />
);

const StatusPill = ({ status }: { status: Order["status"] }) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full",
      status === "Voltooid" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
      status === "Verwerking" && "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
      status === "Geannuleerd" && "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300"
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {status}
  </span>
);

const Dashboard: React.FC = () => {
  const { user, apiFetch, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useLocalStorage<boolean>("sidebar:collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("dashboard");

  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [sortBy, setSortBy] = useState<"id" | "klant" | "status" | "bedrag">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<Array<Order["status"]>>([]);

  const recentOrders: Order[] = [
    { id: "#20251", klant: "Emma Wilson", status: "Voltooid", bedrag: "€149,00" },
    { id: "#20250", klant: "James Miller", status: "Verwerking", bedrag: "€49,00" },
    { id: "#20249", klant: "Sofia Garcia", status: "Geannuleerd", bedrag: "€99,00" },
    { id: "#20248", klant: "Alex Johnson", status: "Voltooid", bedrag: "€299,00" },
    { id: "#20247", klant: "Liam de Vries", status: "Verwerking", bedrag: "€79,00" },
  ];

  const notifications = [
    { type: "success" as const, text: "Nieuwe gebruiker geregistreerd" },
    { type: "warning" as const, text: "Hoge server load gedetecteerd (85%)" },
    { type: "success" as const, text: "Dagelijkse backup voltooid" },
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

  // fetch user
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE}/api/user`, { signal: ctrl.signal });
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
        setError(null);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError("Fout bij ophalen van de gebruiker.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // keyboard: press / to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const base = recentOrders.filter((o) =>
      [o.id, o.klant, o.status].some((v) => v.toLowerCase().includes(term))
    );
    const byStatus = statusFilter.length ? base.filter((o) => statusFilter.includes(o.status)) : base;
    const sorted = [...byStatus].sort((a, b) => {
      let av: string | number = a[sortBy];
      let bv: string | number = b[sortBy];
      if (sortBy === "bedrag") {
        av = parseEuro(a.bedrag);
        bv = parseEuro(b.bedrag);
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [recentOrders, searchTerm, sortBy, sortDir, statusFilter]);

  const SortHeader = ({ field, label }: { field: typeof sortBy; label: string }) => (
    <button
      className="flex items-center gap-1 group select-none"
      onClick={() => {
        if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
          setSortBy(field);
          setSortDir("asc");
        }
      }}
      title={`Sorteren op ${label}`}
    >
      <span className="text-left">{label}</span>
      <span className={clsx("text-[10px]", sortBy === field ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600")}>
        {sortBy === field ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </button>
  );

  const StatCard = ({
    icon,
    iconBg,
    title,
    value,
    trend,
    trendUp,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    value: string;
    trend: string;
    trendUp?: boolean;
  }) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={clsx("p-2 rounded-lg", iconBg)}>{icon}</div>
        <div className={clsx("flex items-center gap-1 text-sm", trendUp ? "text-emerald-600" : "text-rose-600")}
        >
          {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-medium">{trend}</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${value}%` }} />
    </div>
  );

  const RevenueChart = () => {
    const data = Array.from({ length: 12 }).map((_, i) => ({
      month: ["J","F","M","A","M","J","J","A","S","O","N","D"][i],
      omzet: 9000 + Math.round(Math.sin(i / 2) * 3000) + i * 700,
    }));
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillOmzet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => formatCurrency(v).replace("€", "")} width={60} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: any) => [formatCurrency(Number(v)), "Omzet"]}
              contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}
            />
            <Area type="monotone" dataKey="omzet" strokeWidth={2} fill="url(#fillOmzet)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white grid place-items-center text-sm font-bold">
            MA
          </div>
          {!collapsed && <span className="font-semibold text-gray-900 dark:text-gray-100">MyApp</span>}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          title={collapsed ? "Uitklappen" : "Inklappen"}
          aria-label={collapsed ? "Zijbalk uitklappen" : "Zijbalk inklappen"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

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
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                    collapsed ? "justify-center" : "justify-start",
                    active
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={clsx("w-5 h-5", active ? "text-white" : "text-gray-700 dark:text-gray-300")} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className={clsx("flex items-center gap-3 mb-2", collapsed ? "justify-center" : "justify-between")}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white grid place-items-center text-xs font-semibold">
            {displayName?.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{serverUser?.email || user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition"
          title="Uitloggen"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">Uitloggen</span>}
        </button>
      </div>
    </div>
  );

  const ErrorBanner = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
          <RefreshCw className="w-4 h-4" /> Opnieuw
        </button>
      )}
    </div>
  );

  const Overview = () => (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welkom terug, {displayName} 👋</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hier is je overzicht van vandaag. Druk "/" om te zoeken.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          title="Totale omzet"
          value={formatCurrency(156432)}
          trend="+12.5%"
          trendUp
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          title="Nieuwe orders"
          value={"1.247"}
          trend="+5.2%"
          trendUp
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/20"
          title="Totale gebruikers"
          value={"8.926"}
          trend="-2.1%"
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50 dark:bg-violet-900/20"
          title="Conversie"
          value={"3,24%"}
          trend="+0.4%"
          trendUp
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Omzetoverzicht</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Laatste 12 maanden</span>
          </div>
          <RevenueChart />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Meldingen</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {notifications.length} nieuw
            </span>
          </div>
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60">
                <div className={clsx("p-1.5 rounded-full", n.type === "success" ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20")}
                >
                  {n.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bedrijfsinfo + gebruik */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Bedrijfsinformatie</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500 dark:text-gray-400">Naam:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{displayName}</span></p>
            <p><span className="text-gray-500 dark:text-gray-400">E-mail:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{serverUser?.email || user?.email}</span></p>
            {serverUser?.bedrijfsnaam && (
              <p><span className="text-gray-500 dark:text-gray-400">Bedrijf:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{serverUser.bedrijfsnaam}</span></p>
            )}
            {typeof serverUser?.aantal_werknemers === "number" && (
              <p><span className="text-gray-500 dark:text-gray-400">Werknemers:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{serverUser.aantal_werknemers}</span></p>
            )}
            {serverUser?.kvk_nummer && (
              <p><span className="text-gray-500 dark:text-gray-400">KVK:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{serverUser.kvk_nummer}</span></p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Gebruiksoverzicht</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">API calls</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">75%</span>
              </div>
              <ProgressBar value={75} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Opslag</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">42%</span>
              </div>
              <ProgressBar value={42} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Team seats</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">58%</span>
              </div>
              <ProgressBar value={58} />
            </div>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recente orders</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek op order, klant of status…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Zoek orders"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["Voltooid", "Verwerking", "Geannuleerd"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setStatusFilter((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
                  }
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border",
                    statusFilter.includes(s)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="id" label="Order" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="klant" label="Klant" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="status" label="Status" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="bedrag" label="Bedrag" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{o.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{o.klant}</td>
                  <td className="px-6 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{o.bedrag}</td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Geen resultaten voor jouw filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const Analytics = () => (
    <>
      <section className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Laatst bijgewerkt: zojuist</span>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          title="MRR"
          value={formatCurrency(12450)}
          trend="+3.1%"
          trendUp
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/20"
          title="Nieuwe klanten"
          value="214"
          trend="+8.4%"
          trendUp
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50 dark:bg-violet-900/20"
          title="Actieve sessies"
          value="3.142"
          trend="-1.8%"
        />
        <StatCard
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          title="Gem. orderwaarde"
          value={formatCurrency(87.1)}
          trend="+0.9%"
          trendUp
        />
      </section>

      <section className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Maandactiviteit (12 mnd)</h3>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const v = 20 + ((i * 7) % 80);
            return (
              <div key={i} className="space-y-2">
                <div
                  className="h-24 w-full rounded-md"
                  style={{
                    background: `linear-gradient(180deg, rgba(59,130,246,0.${Math.max(2, Math.floor(v / 10))}) 0%, rgba(147,197,253,0.2) 100%)`,
                  }}
                  title={`Maand ${i + 1}`}
                />
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">{
                  ["J","F","M","A","M","J","J","A","S","O","N","D"][i]
                }</p>
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Orders</h2>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek orders…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="id" label="Order" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="klant" label="Klant" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="status" label="Status" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"><SortHeader field="bedrag" label="Bedrag" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{o.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{o.klant}</td>
                  <td className="px-6 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{o.bedrag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex">
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          "hidden md:block sticky top-20 h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Sluit mobiel menu"
          className="fixed inset-0 top-20 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={clsx(
          "fixed md:hidden z-40 left-0 top-20 h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white grid place-items-center text-sm font-bold">MA</div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">MyApp</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3">
          <SidebarContent />
        </nav>
      </aside>

      <div className="flex-1 min-w-0 px-4 lg:px-6 py-6">
        <div className="md:hidden mb-4">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
            Menu
          </button>
        </div>

        {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
            <div className="sm:col-span-2 lg:col-span-3 h-72 mt-6"><Skeleton className="w-full h-full" /></div>
            <div className="h-72 mt-6"><Skeleton className="w-full h-full" /></div>
          </div>
        ) : (
          <>
            {activeKey === "dashboard" && <Overview />}
            {activeKey === "analytics" && <Analytics />}
            {activeKey === "orders" && <Orders />}

            {["users", "docs", "calendar", "settings"].includes(activeKey) && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{activeKey}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                  Dit is een placeholder. Wil je hier specifieke functionaliteit? Laat het me weten.
                </p>
              </div>
            )}
          </>
        )}

        <div className="fixed right-4 bottom-6 md:right-6 md:bottom-8 flex flex-col gap-2">
          <button className="p-3 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow hover:shadow-md" title="Meldingen">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
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