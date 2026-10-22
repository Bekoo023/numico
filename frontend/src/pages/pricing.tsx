import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
const plans = [
  { name: "Starter", price: 9, description: "Een goede basis voor je onderneming.", features: ["Tot 100 bonnetjes per maand", "Basis AI-categorisatie", "Standaard rapportage", "E-mailondersteuning"] },
  { name: "Professional", price: 19, description: "Meer ruimte voor een groeiend bedrijf.", features: ["Onbeperkt bonnetjes", "Geavanceerde AI-functies", "Uitgebreide rapporten", "Integraties (Exact, Twinfield)", "Prioriteit ondersteuning"], popular: true },
  { name: "Enterprise", price: 49, description: "Overzicht voor je hele organisatie.", features: ["Alle Professional-functies", "Multi-user accounts", "Custom integraties", "Dedicated accountmanager", "SLA-garantie"] },
];
export default function Pricing() {
  return <section className="section container"><div className="page-heading"><span className="eyebrow">EEN PLAN VOOR JOUW AMBITIES</span><h1>Klein beginnen.<br /><em>Ruimte om te groeien.</em></h1><p>Kies het plan dat bij jouw onderneming past.<br />Alle mogelijkheden overzichtelijk naast elkaar.</p></div>
    <div className="pricing-grid">{plans.map(plan => <article key={plan.name} className={`price-card ${plan.popular ? "popular" : ""}`}>{plan.popular && <span className="price-badge">MEEST POPULAIR</span>}<h2>{plan.name}</h2><p>{plan.description}</p><div className="price">€ {plan.price}<span> / maand</span></div><ul>{plan.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><Link to={`/register?plan=${plan.name.toLowerCase()}`} className={`button ${plan.popular ? "" : "button-secondary"}`}>Kies {plan.name} <ArrowUpRight size={17} /></Link></article>)}</div>
    <p className="pricing-note">Je begint met een account. Registreren sluit nog geen betaald abonnement af.</p>
    <div className="faq"><h2>Goed om te weten.</h2><details><summary>Hoe begin ik met Numico?</summary><p>Maak een account aan en voeg eventueel je bedrijfsgegevens toe. Daarna kom je in je eigen werkruimte, waar je bonnetjes kunt uploaden en je administratie kunt bekijken.</p></details><details><summary>Kan ik mijn gegevens controleren?</summary><p>Ja. Bekijk de herkende gegevens van ieder bonnetje en pas ze aan waar nodig voordat je ze bevestigt.</p></details><details><summary>Kan ik Numico op mijn telefoon gebruiken?</summary><p>Ja, je werkruimte past zich aan je scherm aan. Je kunt de website gebruiken op je telefoon, tablet en computer.</p></details></div>
  </section>;
}
