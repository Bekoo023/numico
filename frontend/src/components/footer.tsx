import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <img
                  src="logo.png"
                  alt="logo.png"
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white">Numico</span>
            </div>
            <p className="text-slate-400 text-sm">
              Automatiseer je boekhouding met de kracht van AI en bespaar tijd
              voor wat echt belangrijk is.
            </p>
          </div>

          {/* Andere kolommen... */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Prijzen</a></li>
              <li><a href="/demo" className="hover:text-cyan-400 transition-colors">Demo</a></li>
              <li><a href="/api" className="hover:text-cyan-400 transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Ondersteuning</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/help" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              <li><a href="/status" className="hover:text-cyan-400 transition-colors">Status</a></li>
              <li><a href="/updates" className="hover:text-cyan-400 transition-colors">Updates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/about" className="hover:text-cyan-400 transition-colors">Over ons</a></li>
              <li><a href="/careers" className="hover:text-cyan-400 transition-colors">Carrières</a></li>
              <li><a href="/blog" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="/press" className="hover:text-cyan-400 transition-colors">Pers</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <span className="text-slate-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Numico. Alle rechten voorbehouden.
          </span>
          <div className="flex items-center space-x-6 text-slate-400 text-sm">
            <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-cyan-400 transition-colors">Voorwaarden</a>
            <a href="/cookies" className="hover:text-cyan-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
