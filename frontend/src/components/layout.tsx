import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import ThreeScene from "../assets/ThreeScene";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden text-white">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeScene />
      </div>

      <Header />

      <main className="relative z-10 flex-1 pt-24">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
