import { lazy, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import "../premium.css";
const ThreeScene = lazy(() => import("../assets/ThreeScene"));
export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return;
    const titles: Record<string, string> = { "/": "Rust in je administratie", "/pricing": "Prijzen", "/login": "Inloggen", "/register": "Account aanmaken", "/dashboard": "Jouw werkruimte" };
    document.title = `${titles[pathname] || "Pagina niet gevonden"} | Numico`;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return <Outlet />;
  return <div className="site-shell premium-shell"><div className="ambient-background"><Suspense fallback={null}><ThreeScene /></Suspense></div><a className="skip-link" href="#main-content">Naar de inhoud</a><Header /><main id="main-content"><Outlet /></main><Footer /></div>;
}
