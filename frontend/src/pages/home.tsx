import React, { useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let frame: number;

    const animate = () => {
      start += increment;
      if (start < end) {
        setCount(start);
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
        cancelAnimationFrame(frame);
      }
    };
    animate();

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {decimals > 0
        ? count.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

const Home: React.FC = () => {
  const features = [
    {
      icon: "📷",
      title: "Foto Upload",
      description: "Maak gewoon een foto van je bonnetje - AI doet de rest",
    },
    {
      icon: "🧠",
      title: "Slimme Herkenning",
      description: "Automatische extractie van datum, bedrag en leverancier",
    },
    {
      icon: "📊",
      title: "Rapportage",
      description: "Uitgebreide rapporten voor accountant en belastingdienst",
    },
    {
      icon: "💰",
      title: "Kostenbeheer",
      description: "Houd uitgaven per categorie en project bij",
    },
    {
      icon: "🔄",
      title: "Automatisering",
      description: "Terugkerende posten worden automatisch herkend",
    },
    {
      icon: "📱",
      title: "Mobiel & Desktop",
      description: "Gebruik overal - op kantoor of onderweg",
    },
  ];

  const stats = [
    { number: 2000, label: "Tevreden gebruikers", suffix: "+", prefix: "" },
    { number: 120000, label: "Verwerkte bonnetjes", suffix: "+", prefix: "" },
    {
      number: 98.2,
      label: "Nauwkeurigheid van AI",
      suffix: "%",
      decimals: 1,
      prefix: "",
    },
    {
      number: 5,
      label: "Gemiddelde tijdsbesparing",
      suffix: " min",
      prefix: "",
    },
  ];

  return (
    <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 py-32">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-medium text-cyan-300">
            Nieuwe AI-technologie beschikbaar
          </span>
        </div>

        <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Automatiseer je{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            boekhouding
          </span>
          <br />
          <span className="text-4xl md:text-6xl">met AI</span>
        </h2>

        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Upload bonnetjes, categoriseer automatisch en houd grip op je
          uitgaven.
          <br className="hidden md:block" />
          <span className="font-semibold text-slate-200">
            Zonder gedoe, mét slimme tools.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="/app"
            className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 flex items-center space-x-2"
          >
            <span>Start direct</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a
            href="/demo"
            className="group bg-slate-800/60 backdrop-blur-sm text-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-700/60 transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-600/50 hover:border-cyan-400/50 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Bekijk demo</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                <CountUp
                  end={stat.number}
                  duration={1100 + index * 400}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                />
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section
        id="features"
        className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent to-slate-900/50 w-full"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Krachtige functies voor{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              moderne ondernemers
            </span>
          </h3>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Ontdek hoe Numico jouw boekhouding revolutioneert met geavanceerde
            AI-technologie
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-4 text-center">
                  {feature.title}
                </h4>
                <p className="text-slate-400 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-10 px-6 py-20 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Zo werkt het in{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              3 simpele stappen
            </span>
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                1
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">
                Upload bonnetje
              </h4>
              <p className="text-slate-400">
                Maak een foto of upload een scan van je bonnetje
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                2
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">
                AI verwerkt
              </h4>
              <p className="text-slate-400">
                Onze AI extraheert automatisch alle relevante informatie
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 mx-auto text-2xl font-bold text-white shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
                3
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">Klaar!</h4>
              <p className="text-slate-400">
                Je uitgave is gecategoriseerd en toegevoegd aan je boekhouding
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Klaar om te beginnen met{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              slimme boekhouding?
            </span>
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Sluit je aan bij duizenden ondernemers die al tijd besparen met
            Numico
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/app"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1"
            >
              Start gratis proefperiode
            </a>
            <a
              href="/contact"
              className="bg-slate-800/60 backdrop-blur-sm text-slate-200 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-700/60 transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-600/50 hover:border-cyan-400/50"
            >
              Neem contact op
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
