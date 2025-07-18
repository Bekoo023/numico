import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!savedUser || !token) {
        navigate("/login");
        return;
      }

      try {
        // Verificeer of de user nog geldig is
        const response = await fetch("http://backend.test/api/user", {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token is verlopen, redirect naar login
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await fetch("http://backend.test/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Altijd lokale data verwijderen
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">Welkom, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profiel Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Profiel</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400">Naam:</span>
                <p className="text-white font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Lid since:</span>
                <p className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          </div>

          {/* Statistieken Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Statistieken</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Totaal logins:</span>
                <span className="text-cyan-400 font-semibold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Laatste login:</span>
                <span className="text-cyan-400 font-semibold">Vandaag</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className="text-green-400 font-semibold">Actief</span>
              </div>
            </div>
          </div>

          {/* Acties Card */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Acties</h2>
            <div className="space-y-3">
              <button className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                Profiel bewerken
              </button>
              <button className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Wachtwoord wijzigen
              </button>
              <button className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                Instellingen
              </button>
            </div>
          </div>
        </div>

        {/* Recente Activiteit */}
        <div className="mt-8 bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Recente Activiteit</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-white">Succesvol ingelogd</p>
                <p className="text-slate-400 text-sm">Vandaag om 14:30</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div>
                <p className="text-white">Account aangemaakt</p>
                <p className="text-slate-400 text-sm">
                  {new Date(user.created_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;