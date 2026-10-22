import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthIntro from "../components/AuthIntro";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://backend.test";
const initialForm = { voornaam: "", achternaam: "", email: "", password: "", password_confirmation: "", leeftijd: "", aanhef: "meneer", bedrijfsnaam: "", aantal_werknemers: "", kvk_nummer: "" };
type FieldName = keyof typeof initialForm;
export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [params] = useSearchParams();
  const selectedPlan = { starter: "Starter", professional: "Professional", enterprise: "Enterprise" }[params.get("plan") || ""];
  const navigate = useNavigate();
  const { login } = useAuth();
  const update = (name: FieldName, value: string) => {
    setForm(previous => ({ ...previous, [name]: value }));
    setErrors(previous => { const next = { ...previous }; delete next[name]; return next; });
    setError(null);
  };
  function validatePersonal() {
    if (!form.voornaam.trim() || !form.achternaam.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.password.length < 6) {
      setError("Vul je naam, een geldig e-mailadres en een wachtwoord van minimaal 6 tekens in."); setStep(1); return false;
    }
    if (form.password !== form.password_confirmation) { setErrors({ password_confirmation: ["De wachtwoorden komen niet overeen."] }); setStep(1); return false; }
    return true;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!validatePersonal()) return;
    if (step === 1) { setStep(2); return; }
    if (form.kvk_nummer && !/^\d{8}$/.test(form.kvk_nummer)) { setErrors({ kvk_nummer: ["Vul een KVK-nummer van 8 cijfers in."] }); setStep(2); return; }
    if (step === 2) { setStep(3); return; }
    setLoading(true); setErrors({});
    try {
      const res = await fetch(`${API_BASE}/api/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase(), leeftijd: form.leeftijd ? Number(form.leeftijd) : null, bedrijfsnaam: form.bedrijfsnaam || null, aantal_werknemers: form.aantal_werknemers ? Number(form.aantal_werknemers) : null, kvk_nummer: form.kvk_nummer || null }) });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const personal = ["voornaam", "achternaam", "email", "password", "password_confirmation", "leeftijd", "aanhef"];
          setStep(Object.keys(data.errors).some(key => personal.includes(key)) ? 1 : 2);
        }
        setError(data.message || "Registreren is niet gelukt. Probeer het opnieuw."); return;
      }
      if (!data.user || !data.token) { setError("Registreren kon niet worden bevestigd. Probeer in te loggen."); return; }
      login(data.user, data.token); navigate("/dashboard");
    } catch { setError("Kon geen verbinding maken met de server. Probeer het opnieuw."); }
    finally { setLoading(false); }
  }
  const field = (name: FieldName, label: string, type = "text", required = false, autoComplete?: string) => <div><label htmlFor={name}>{label}</label><input id={name} name={name} type={type} value={form[name]} onChange={e => update(name, e.target.value)} required={required} autoComplete={autoComplete} min={name === "leeftijd" ? 16 : name === "aantal_werknemers" ? 0 : undefined} max={name === "leeftijd" ? 120 : undefined} minLength={name.startsWith("password") ? 6 : undefined} inputMode={name === "kvk_nummer" ? "numeric" : undefined} maxLength={name === "kvk_nummer" ? 8 : undefined} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />{errors[name] && <span id={`${name}-error`} className="field-error">{errors[name][0]}</span>}</div>;
  return <section className="auth-page container"><AuthIntro register /><div className="auth-card"><div className="auth-steps" aria-label={`Stap ${step} van 3`}>{["Jouw account", "Je bedrijf", "Controle"].map((label, i) => <span className={step >= i + 1 ? "active" : ""} aria-current={step === i + 1 ? "step" : undefined} key={label}>{i + 1}. {label}</span>)}</div><h2>{step === 1 ? "Maak ruimte voor overzicht" : step === 2 ? "Vertel over je bedrijf" : "Klaar voor de start?"}</h2><p>{step === 1 ? "Maak je persoonlijke account aan." : step === 2 ? "Deze gegevens zijn optioneel. Je kunt ook direct verder." : "Controleer je gegevens en maak je account aan."}{selectedPlan && <> Je bekijkt het {selectedPlan}-plan.</>}</p>
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>{error && <div className="auth-error" role="alert">{error}</div>}
    {step === 1 && <><div className="form-row">{field("voornaam", "Voornaam *", "text", true, "given-name")}{field("achternaam", "Achternaam *", "text", true, "family-name")}</div>{field("email", "E-mailadres *", "email", true, "email")}{field("password", "Wachtwoord * · minimaal 6 tekens", "password", true, "new-password")}{field("password_confirmation", "Herhaal wachtwoord *", "password", true, "new-password")}<div className="form-row"><label htmlFor="aanhef">Aanhef<select id="aanhef" value={form.aanhef} onChange={e => update("aanhef", e.target.value)}><option value="meneer">Meneer</option><option value="mevrouw">Mevrouw</option></select></label>{field("leeftijd", "Leeftijd · optioneel", "number")}</div></>}
    {step === 2 && <>{field("bedrijfsnaam", "Bedrijfsnaam", "text", false, "organization")}{field("kvk_nummer", "KVK-nummer · 8 cijfers")}{field("aantal_werknemers", "Aantal werknemers", "number")}</>}
    {step === 3 && <dl className="auth-review"><div><dt>Naam</dt><dd>{form.voornaam} {form.achternaam}</dd></div><div><dt>E-mailadres</dt><dd>{form.email}</dd></div><div><dt>Bedrijf</dt><dd>{form.bedrijfsnaam || "Niet ingevuld"}</dd></div><div><dt>KVK-nummer</dt><dd>{form.kvk_nummer || "Niet ingevuld"}</dd></div></dl>}
    <div className="auth-actions">{step > 1 && <button type="button" className="button button-secondary" disabled={loading} onClick={() => { setStep(step - 1); setError(null); }}>Vorige</button>}<button className="button" type="submit" disabled={loading}>{loading ? "Account aanmaken…" : step === 3 ? "Account aanmaken" : "Volgende stap"}{step === 3 ? <Check size={17} /> : <ArrowRight size={17} />}</button></div>
    </form><div className="auth-bottom">Al een account? <Link to="/login">Log in</Link></div></div></section>;
}
