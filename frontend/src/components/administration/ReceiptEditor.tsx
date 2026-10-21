import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, Download, RefreshCw, X } from "lucide-react";
import { errorMessage, jsonRequest, statusLabels, toCents, useAdministrationApi } from "./api";
import type { Receipt } from "./api";

export default function ReceiptEditor({ receipt, onClose, onSaved, onExtract }: { receipt: Receipt; onClose: () => void; onSaved: () => void; onExtract: (receipt: Receipt) => Promise<void> }) {
  const api = useAdministrationApi();
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ vendor: receipt.vendor || "", receipt_date: receipt.receipt_date?.slice(0, 10) || "", currency: receipt.currency || "EUR", total: receipt.total_cents === null ? "" : (receipt.total_cents / 100).toFixed(2), vat: receipt.vat_cents === null ? "" : (receipt.vat_cents / 100).toFixed(2), category: receipt.category || "", notes: receipt.notes || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    let url: string | null = null;
    void api(`/receipts/${receipt.id}/file`, { signal: controller.signal }).then(response => response.blob()).then(blob => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob); setPreview(url);
    }).catch(error => { if (!controller.signal.aborted) setPreviewError(errorMessage(error)); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [api, receipt.id]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const total = toCents(form.total), vat = toCents(form.vat);
    if (total === null || vat === null) { setError("Vul bedragen in met maximaal twee decimalen, bijvoorbeeld 12,50."); return; }
    setBusy(true); setError("");
    try {
      await api(`/receipts/${receipt.id}`, jsonRequest("PATCH", { vendor: form.vendor, receipt_date: form.receipt_date, currency: form.currency.toUpperCase(), total_cents: total, vat_cents: vat, category: form.category, notes: form.notes || null }));
      onSaved(); onClose();
    } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  async function retry() {
    setBusy(true); setError("");
    try { await onExtract(receipt); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="admin-dialog" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} aria-labelledby="receipt-title">
    <div className="admin-dialog-heading"><div><p className="dash-eyebrow">BON #{receipt.id} · {statusLabels[receipt.status]}</p><h2 id="receipt-title">Controleer je bonnetje</h2></div><button className="admin-icon-button" onClick={onClose} disabled={busy} aria-label="Sluiten"><X size={20} /></button></div>
    <div className="admin-editor-grid"><div className="admin-preview">
      {preview ? <>{receipt.mime === "application/pdf" ? <iframe src={preview} title="Originele bon" /> : <img src={preview} alt="Origineel geüpload bonnetje" />}<a className="dash-button" href={preview} download={receipt.original_name}><Download size={15} />Origineel downloaden</a></> : <p role="status">{previewError || "Origineel ophalen…"}</p>}
    </div><form onSubmit={save} className="admin-form">
      <p className="dash-muted">Vergelijk de bedragen met het origineel. Pas na opslaan telt deze bon mee in je overzicht en bij de assistent.</p>
      {receipt.extraction?.warnings?.map((warning, i) => <p className="admin-warning" key={i}>{warning}</p>)}
      {receipt.error && <p className="admin-warning">{receipt.error}</p>}
      <label>Leverancier<input autoFocus required maxLength={255} value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></label>
      <div className="admin-form-row"><label>Datum<input type="date" required min="1900-01-01" max="2100-12-31" value={form.receipt_date} onChange={e => setForm({ ...form, receipt_date: e.target.value })} /></label><label>Valuta<input required pattern="[A-Za-z]{3}" maxLength={3} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></label></div>
      <div className="admin-form-row"><label>Totaal inclusief btw<input required inputMode="decimal" placeholder="0,00" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} /></label><label>Btw op de bon<input required inputMode="decimal" placeholder="0,00" value={form.vat} onChange={e => setForm({ ...form, vat: e.target.value })} /></label></div>
      <label>Categorie<input required maxLength={255} list="receipt-categories" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /><datalist id="receipt-categories">{["Kantoor", "Reiskosten", "Software", "Inkoop", "Horeca", "Overig"].map(value => <option key={value} value={value} />)}</datalist></label>
      <label>Notities<textarea rows={2} maxLength={4000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
      <p className="dash-muted">Btw op de bon is niet automatisch aftrekbare btw. Vul 0 alleen in als er werkelijk geen btw is vermeld of verschuldigd.</p>
      {error && <p className="admin-warning" role="alert">{error}</p>}
      <div className="admin-form-actions">{receipt.status !== "confirmed" && <button type="button" className="dash-button" disabled={busy} onClick={() => void retry()}><RefreshCw size={14} />Opnieuw uitlezen</button>}<button type="submit" className="dash-button admin-primary" disabled={busy}><Check size={15} />{busy ? "Bezig…" : "Controleren en opslaan"}</button></div>
    </form></div>
  </dialog>;
}
