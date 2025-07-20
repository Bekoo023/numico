import React from "react";

const pricingPlans = [
  {
    name: "Starter",
    price: "€9",
    period: "/maand",
    description: "Perfect voor starters",
    features: [
      "Tot 100 bonnetjes per maand",
      "Basis AI-categorisatie",
      "Standaard rapportage",
      "Email ondersteuning",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "€19",
    period: "/maand",
    description: "Voor groeiende bedrijven",
    features: [
      "Onbeperkt bonnetjes",
      "Geavanceerde AI-functies",
      "Uitgebreide rapporten",
      "Integraties (Exact, Twinfield)",
      "Prioriteit ondersteuning",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "€49",
    period: "/maand",
    description: "Voor grote organisaties",
    features: [
      "Alle Professional functies",
      "Multi-user accounts",
      "Custom integraties",
      "Dedicated account manager",
      "SLA garantie",
    ],
    popular: false,
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative z-10 px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-6 leading-tight">
          Kies het juiste plan voor{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            jouw bedrijf
          </span>
        </h3>
        <p className="text-slate-400 text-center mb-16 text-lg">
          Geen verborgen kosten. Je kunt op elk moment opzeggen.
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-slate-800/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/10 ${
                plan.popular
                  ? "border-2 border-cyan-400/40 shadow-cyan-500/20"
                  : "border border-slate-700/50 hover:border-cyan-400/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                  Meest populair
                </div>
              )}

              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <p className="text-slate-400 mb-4 text-sm">
                  {plan.description}
                </p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-extrabold">
                    {plan.price}
                  </span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 text-sm">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center text-slate-300 hover:text-cyan-400 transition duration-150"
                  >
                    <svg
                      className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    : "bg-slate-700/60 text-slate-200 hover:bg-slate-600/60 border border-slate-600/50 hover:border-cyan-400/50"
                }`}
              >
                Start nu
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;