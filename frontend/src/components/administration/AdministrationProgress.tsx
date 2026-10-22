import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCheck, Sparkles } from "lucide-react";
import type { Summary } from "./api";

export default function AdministrationProgress({ summary, loading, stale }: { summary?: Summary; loading: boolean; stale: boolean }) {
  const count = summary?.count ?? 0;
  const confirmed = summary?.confirmed ?? 0;
  const percent = count ? Math.min(100, Math.max(0, Math.round(confirmed / count * 100))) : 0;
  return <section className="dash-card admin-progress" aria-label="Voortgang administratie" aria-busy={loading}>
    <div className="dash-section-heading"><div><h2>Jouw voortgang</h2></div><CheckCheck size={20} /></div>
    <div className={`admin-progress-content ${stale ? "admin-is-loading" : ""}`}>
      <div className="admin-progress-ring" style={{ background: `conic-gradient(#8edcf1 ${percent}%, #8ea9d31a 0)` }}><div><strong>{!summary ? "—" : `${percent}%`}</strong><span>gecontroleerd</span></div></div>
      <div><h3>{!summary ? "Je overzicht wordt opgehaald" : !count ? "Klaar voor je eerste bon" : confirmed === count ? "Alles gecontroleerd" : "Nog te controleren"}</h3><p>{!summary ? loading ? "Je actuele cijfers komen eraan." : "Vernieuw je overzicht om je voortgang te zien." : !count ? "Upload een bonnetje en bouw aan een helder overzicht." : `${confirmed} van ${count} bonnetjes gecontroleerd in de geselecteerde periode.`}</p>{summary && !!count && <Link to="/dashboard/bonnetjes">Bekijk bonnetjes <ArrowUpRight size={14} /></Link>}</div>
    </div>
    <div className="admin-progress-tip"><Sparkles size={16} /><span>Vragen over je cijfers? <Link to="/dashboard/assistent">Open de assistent.</Link></span></div>
  </section>;
}
