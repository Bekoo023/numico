import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCheck } from "lucide-react";
import type { Summary } from "./api";

export default function AdministrationProgress({ summary, loading, stale }: { summary?: Summary; loading: boolean; stale: boolean }) {
  const count = summary?.count ?? 0;
  const confirmed = summary?.confirmed ?? 0;
  const percent = count ? Math.min(100, Math.max(0, Math.round(confirmed / count * 100))) : 0;
  return <section className="dash-card admin-progress" aria-label="Voortgang administratie" aria-busy={loading}>
    <div className="dash-section-heading"><div><h2>Gecontroleerde bonnen</h2></div><CheckCheck size={20} /></div>
    <div className={`admin-progress-content ${stale ? "admin-is-loading" : ""}`}>
      <div className="admin-progress-ring" style={{ background: `conic-gradient(#8edcf1 ${percent}%, #8ea9d31a 0)` }}><div><strong>{!summary ? "—" : `${percent}%`}</strong><span>gecontroleerd</span></div></div>
      <div><h3>{!summary ? "Je overzicht wordt opgehaald" : !count ? "Nog geen bonnen" : confirmed === count ? "Alles gecontroleerd" : "Nog te controleren"}</h3><p>{!summary ? loading ? "Gegevens laden." : "Vernieuw je overzicht om je voortgang te zien." : !count ? "Voeg een bon toe via Uploaden." : `${confirmed} van ${count} bonnetjes gecontroleerd in de geselecteerde periode.`}</p>{summary && !!count && <Link to="/dashboard/bonnetjes">Bekijk bonnetjes <ArrowUpRight size={14} /></Link>}</div>
    </div>
  </section>;
}
