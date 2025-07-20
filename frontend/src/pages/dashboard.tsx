import React, { useState, useEffect } from "react";
import { Settings, Edit3, Key, Activity, Calendar, TrendingUp, Eye, Bell, LogOut } from "lucide-react";

// Mock useAuth hook voor de demo
const useAuth = () => ({
  user: {
    name: "Jan van der Berg",
    email: "jan.vandenberg@example.com", 
    created_at: "2023-03-15T10:30:00Z",
    avatar: "JB"
  },
  logout: () => console.log("Uitloggen...")
});

// Mock navigate function
const useNavigate = () => (path: string) => console.log(`Navigating to ${path}`);

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalLogins: 0,
    todayLogins: 0,
    activeTime: 0
  });

  // Real-time klok
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Animatie voor statistieken
  useEffect(() => {
    const animateStats = () => {
      const targetStats = { totalLogins: 147, todayLogins: 3, activeTime: 2840 };
      let current = { totalLogins: 0, todayLogins: 0, activeTime: 0 };
      
      const increment = () => {
        current.totalLogins = Math.min(current.totalLogins + 3, targetStats.totalLogins);
        current.todayLogins = Math.min(current.todayLogins + 1, targetStats.todayLogins);
        current.activeTime = Math.min(current.activeTime + 50, targetStats.activeTime);
        
        setStats({...current});
        
        if (current.totalLogins < targetStats.totalLogins) {
          setTimeout(increment, 30);
        }
      };
      
      setTimeout(increment, 500);
    };
    
    animateStats();
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}u ${mins}m`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="group bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 hover:scale-[1.02] hover:bg-slate-800/80">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
            {value}
          </div>
          <div className="text-slate-400 text-sm">{subtitle}</div>
        </div>
      </div>
      <h3 className="text-slate-300 font-medium">{title}</h3>
    </div>
  );

  type VariantType = "primary" | "secondary" | "danger";
  interface ActionButtonProps {
    icon: React.ElementType;
    title: string;
    onClick: () => void;
    variant?: VariantType;
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, title, onClick, variant = "secondary" }) => {
    const variants: Record<VariantType, string> = {
      primary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25",
      secondary: "bg-slate-700/80 hover:bg-slate-600/80 text-white border border-slate-600/50",
      danger: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25"
    };
    
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${variants[variant]}`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{title}</span>
      </button>
    );
  };

  const ActivityItem = ({message, time, color }: any) => (
    <div className="group flex items-center space-x-4 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-[1.01]">
      <div className={`w-3 h-3 rounded-full ${color} shadow-lg animate-pulse`}></div>
      <div className="flex-1">
        <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">{message}</p>
        <p className="text-slate-400 text-sm flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{time}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/50 to-slate-950"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  Welkom terug, {user.name}!
                </h1>
                <p className="text-slate-400">{time.toLocaleTimeString('nl-NL')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Uitloggen</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={TrendingUp}
            title="Totaal Logins"
            value={stats.totalLogins}
            subtitle="Alle tijd"
            color="from-cyan-600 to-blue-600"
          />
          <StatCard
            icon={Activity}
            title="Vandaag"
            value={stats.todayLogins}
            subtitle="Logins"
            color="from-green-600 to-emerald-600"
          />
          <StatCard
            icon={Eye}
            title="Actieve Tijd"
            value={formatTime(stats.activeTime)}
            subtitle="Deze maand"
            color="from-purple-600 to-violet-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl">
                  {user.avatar}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-cyan-400 mb-2">{user.email}</p>
                <div className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Online
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Lid sinds</span>
                  <span className="text-white font-medium">
                    {new Date(user.created_at).toLocaleDateString("nl-NL")}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Account type</span>
                  <span className="text-cyan-400 font-medium">Premium</span>
                </div>
              </div>

              <div className="space-y-3">
                <ActionButton
                  icon={Edit3}
                  title="Profiel Bewerken"
                  variant="primary"
                  onClick={() => console.log("Profiel bewerken")}
                />
                <ActionButton
                  icon={Key}
                  title="Wachtwoord Wijzigen"
                  onClick={() => console.log("Wachtwoord wijzigen")}
                />
                <ActionButton
                  icon={Settings}
                  title="Instellingen"
                  onClick={() => console.log("Instellingen")}
                />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recente Activiteit</h2>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Activity className="w-5 h-5" />
                  <span>Live</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <ActivityItem
                  type="login"
                  message="Succesvol ingelogd vanuit Chrome"
                  time="Vandaag om 14:30"
                  color="bg-green-400"
                />
                <ActivityItem
                  type="update"
                  message="Profiel bijgewerkt"
                  time="Gisteren om 16:45"
                  color="bg-cyan-400"
                />
                <ActivityItem
                  type="security"
                  message="Wachtwoord gewijzigd"
                  time="3 dagen geleden"
                  color="bg-yellow-400"
                />
                <ActivityItem
                  type="create"
                  message="Account aangemaakt"
                  time={new Date(user.created_at).toLocaleDateString("nl-NL")}
                  color="bg-blue-400"
                />
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <span className="text-cyan-300 font-medium">Je account is beveiligd en up-to-date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;