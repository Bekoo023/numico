import { useEffect, useRef, useState } from "react";
import { CheckCheck, ChevronLeft, ChevronRight, FileText, ReceiptText, Search, Upload, Wallet } from "lucide-react";
import { errorMessage, money, statusLabels, useAdministrationApi } from "./api";
import type { Receipt, ReceiptResponse } from "./api";
import ReceiptEditor from "./ReceiptEditor";
import AdministrationChat from "./AdministrationChat";
import "./administration.css";

export default function Administration({ refresh }: { refresh: number }) {
  const api = useAdministrationApi();
  const [data, setData] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const uploadLimit = data?.upload_max_bytes ?? 10 * 1024 * 1024;
  const uploadLimitLabel = (uploadLimit / 1024 / 1024).toLocaleString("nl-NL", { maximumFractionDigits: 1 });
  const invalidDates = Boolean(from && to && from > to);
  const reload = () => setRevision(value => value + 1);

  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    if (invalidDates) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), search: query, status });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    setLoading(true); setError("");
    void api(`/receipts?${params}`, { signal: controller.signal }).then(response => response.json()).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, page, query, status, from, to, revision, refresh, invalidDates]);

  async function extract(receipt: Receipt) {
    try {
      const response = await api(`/receipts/${receipt.id}/extract`, { method: "POST" });
      const result = await response.json();
      setSelected(result.receipt);
    } finally { reload(); }
  }
  async function upload(file: File | undefined) {
    if (!file || uploading) return;
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) { setNotice("Kies een JPG, PNG, WebP of PDF."); return; }
    if (file.size > uploadLimit) { setNotice(`Je bestand mag op deze server maximaal ${uploadLimitLabel} MB zijn.`); return; }
    setUploading(true); setNotice(""); setUploadStatus("Bonnetje veilig opslaan…");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await api("/receipts", { method: "POST", body });
      const result = await response.json();
      reload();
      if (result.duplicate) { setNotice("Dit bestand staat al in je administratie. De bestaande bon is geopend."); setSelected(result.receipt); }
      else {
        setUploadStatus("AI leest de leverancier, datum, bedragen en btw uit…");
        try { await extract(result.receipt); setNotice("Je bon is uitgelezen. Controleer de gegevens en sla ze op."); }
        catch (error) { setNotice(`${errorMessage(error)} Je bon is bewaard. Je kunt later opnieuw uitlezen of de bedragen handmatig invullen.`); setSelected(result.receipt); }
      }
    } catch (error) { setNotice(errorMessage(error)); }
    finally { setUploading(false); setUploadStatus(""); if (input.current) input.current.value = ""; }
  }
  const summary = data?.summary;
  const euro = summary?.currencies.find(item => item.currency === "EUR");
  const stale = loading || Boolean(error) || invalidDates;
  const value = (n: string | number | undefined) => !data ? (loading ? "…" : "—") : n;

  return <>
    <div className="admin-period"><div><span className="dash-eyebrow">JOUW ADMINISTRATIE</span><p>Alleen gecontroleerde bonnen tellen mee in de bedragen.</p></div><div className="admin-period-fields"><label>Van<input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} /></label><label>Tot en met<input type="date" value={to} min={from || undefined} onChange={e => { setTo(e.target.value); setPage(1); }} /></label>{(from || to) && <button className="dash-button" onClick={() => { setFrom(""); setTo(""); setPage(1); }}>Alles</button>}</div></div>
    {invalidDates && <p className="admin-warning" role="alert">De einddatum moet op of na de begindatum liggen. Je ziet nog de vorige gegevens.</p>}
    {error && <p className="admin-warning" role="alert">{error} {data && "Je ziet de laatst opgehaalde gegevens."} <button onClick={reload}>Opnieuw proberen</button></p>}
    <section className={`dash-stats ${stale ? "admin-is-loading" : ""}`} aria-label="Administratiecijfers" aria-busy={loading}>
      <article className="dash-stat dash-stat-featured"><div className="dash-stat-top"><span>Uitgaven inclusief btw</span><span className="dash-icon"><Wallet size={20} /></span></div><strong className="dash-stat-value admin-money">{value(money(euro?.total_cents ?? 0))}</strong><div className="dash-stat-foot">Gecontroleerde bonnen · EUR</div></article>
      <article className="dash-stat"><div className="dash-stat-top"><span>Btw op je bonnen</span><span className="dash-icon mint"><ReceiptText size={20} /></span></div><strong className="dash-stat-value admin-money">{value(money(euro?.vat_cents ?? 0))}</strong><div className="dash-stat-foot">Vermelde btw · niet automatisch aftrekbaar</div></article>
      <article className="dash-stat"><div className="dash-stat-top"><span>Bonnetjes</span><span className="dash-icon lavender"><FileText size={20} /></span></div><strong className="dash-stat-value">{value(summary?.count)}</strong><div className="dash-stat-foot">{summary?.confirmed ?? "—"} gecontroleerd in deze periode</div></article>
      <article className="dash-stat"><div className="dash-stat-top"><span>Nog controleren</span><span className="dash-icon peach"><CheckCheck size={20} /></span></div><strong className="dash-stat-value">{value(summary?.pending)}</strong><div className="dash-stat-foot"><a href="#receipts">Bekijk je bonnetjes →</a></div></article>
    </section>
    {summary?.currencies.filter(item => item.currency !== "EUR").map(item => <p className="admin-currency-note" key={item.currency}>{item.currency}: {money(item.total_cents, item.currency)} uitgaven · {money(item.vat_cents, item.currency)} btw. Apart gehouden van je eurototalen.</p>)}
    {(from || to) && !!summary?.undated && <p className="admin-currency-note">{summary.undated} bon(nen) zonder datum vallen buiten het periodefilter. Kies ‘Alles’ om ze te controleren.</p>}

    <section className="admin-upload dash-card" id="upload" onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files[0]); }} data-dragging={dragging}>
      <span className="admin-upload-icon"><Upload size={27} /></span><div><p className="dash-eyebrow">VAN BONNETJE NAAR OVERZICHT</p><h2>{uploading ? "Je bonnetje wordt verwerkt" : "Geef je bonnetjes een plek"}</h2><p>{uploading ? uploadStatus : "Sleep één bonnetje hierheen of kies een bestand. AI haalt de belangrijkste gegevens eruit."}</p><span>JPG, PNG, WebP of PDF · maximaal {uploadLimitLabel} MB · één bon per bestand</span></div><button className="dash-button admin-primary" onClick={() => input.current?.click()} disabled={uploading}><Upload size={16} />{uploading ? "Bezig…" : "Bonnetje uploaden"}</button><input className="admin-sr-only" type="file" tabIndex={-1} ref={input} accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="Bonnetje kiezen" onChange={e => void upload(e.target.files?.[0])} />
      <p className="admin-upload-privacy">Je document wordt voor het uitlezen naar OpenAI gestuurd en privé in je administratie bewaard.</p>
    </section>
    {notice && <p className="admin-notice" role="status">{notice}</p>}

    <section className="dash-card admin-receipts" id="receipts"><div className="dash-section-heading"><div><p className="dash-eyebrow">JE DIGITALE BONNENMAP</p><h2>Bonnetjes</h2></div><span className="dash-tag">{data?.receipts.total ?? "—"} resultaten</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek leverancier of bestandsnaam…" aria-label="Bonnetjes zoeken" maxLength={255} /></label><label><span className="admin-sr-only">Status filteren</span><select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Alle statussen</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
      <div className="admin-table-wrap" aria-busy={loading}><table className="admin-table"><thead><tr><th>Bon / leverancier</th><th>Datum</th><th>Totaal</th><th>Btw</th><th>Status</th><th><span className="admin-sr-only">Acties</span></th></tr></thead><tbody>
        {data?.receipts.data.map(receipt => <tr key={receipt.id}><td><strong>{receipt.vendor || receipt.original_name}</strong><span>#{receipt.id} · {receipt.category || "Nog geen categorie"}</span></td><td>{receipt.receipt_date ? new Date(`${receipt.receipt_date.slice(0, 10)}T12:00:00`).toLocaleDateString("nl-NL") : "—"}</td><td>{receipt.currency ? money(receipt.total_cents, receipt.currency) : "—"}</td><td>{receipt.currency ? money(receipt.vat_cents, receipt.currency) : "—"}</td><td><span className={`admin-status ${receipt.status}`}>{statusLabels[receipt.status]}</span></td><td><button className="admin-text-button" onClick={() => setSelected(receipt)}>{receipt.status === "confirmed" ? "Bekijken" : "Controleren"}</button></td></tr>)}
        {(!data || !data.receipts.data.length) && <tr><td colSpan={6}><div className="admin-empty"><ReceiptText size={30} /><h3>{loading ? "Bonnetjes ophalen…" : error ? "Bonnetjes niet beschikbaar" : query || status || from || to ? "Geen bonnetjes voor deze selectie" : "Je administratie begint met je eerste bon"}</h3><p>{query || status || from || to ? "Pas je zoekopdracht of filters aan." : "Upload een bonnetje. Controleer de gegevens en zie je overzicht groeien."}</p></div></td></tr>}
      </tbody></table></div>
      <div className="admin-pagination"><span>Pagina {data?.receipts.current_page ?? 1} van {data?.receipts.last_page ?? 1}{loading ? " · bijwerken…" : ""}</span><div><button className="dash-button" aria-label="Vorige pagina" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}><ChevronLeft size={16} /></button><button className="dash-button" aria-label="Volgende pagina" disabled={!data || page >= data.receipts.last_page || loading} onClick={() => setPage(value => value + 1)}><ChevronRight size={16} /></button></div></div>
    </section>
    <AdministrationChat from={from} to={to} revision={revision} invalidPeriod={invalidDates} />
    {selected && <ReceiptEditor key={`${selected.id}-${selected.updated_at || selected.status}`} receipt={selected} onClose={() => setSelected(null)} onSaved={() => { reload(); setNotice("Je bon is gecontroleerd en opgeslagen. Het overzicht en nieuwe AI-antwoorden gebruiken deze gegevens."); }} onExtract={async receipt => { await extract(receipt); }} />}
  </>;
}
