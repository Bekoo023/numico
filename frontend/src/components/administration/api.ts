import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://backend.test";
export type Receipt = {
  id: number; original_name: string; mime: string; updated_at?: string;
  status: "uploaded" | "processing" | "review" | "confirmed" | "failed";
  vendor: string | null; receipt_date: string | null; currency: string | null;
  total_cents: number | null; vat_cents: number | null; category: string | null;
  notes: string | null; error: string | null; extraction: { warnings?: string[] } | null;
};
export type Summary = {
  count: number; pending: number; confirmed: number; undated: number;
  currencies: { currency: string; total_cents: number | string; vat_cents: number | string; count: number }[];
  categories: { category: string; total_cents: number | string }[];
};
export type ReceiptResponse = { receipts: { data: Receipt[]; current_page: number; last_page: number; total: number }; summary: Summary; upload_max_bytes?: number };
export type Message = { id: number; role: "user" | "assistant"; content: string; sources?: { url: string; title: string }[] };
export const statusLabels: Record<Receipt["status"], string> = { uploaded: "Nog uitlezen", processing: "Wordt uitgelezen", review: "Controleren", confirmed: "Gecontroleerd", failed: "Uitlezen mislukt" };
export function money(cents: number | string | null, currency = "EUR") {
  if (cents === null) return "—";
  try { return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(Number(cents) / 100); }
  catch { return `${(Number(cents) / 100).toFixed(2)} ${currency}`; }
}
export function toCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const negative = normalized.startsWith("-");
  const [whole, fraction = ""] = normalized.replace("-", "").split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? (negative ? -amount : amount) : null;
}
export function useAdministrationApi() {
  const { apiFetch, logout } = useAuth();
  const navigate = useNavigate();
  return useCallback(async (path: string, options: RequestInit = {}) => {
    let response: Response;
    try { response = await apiFetch(`${API_BASE}/api${path}`, options); }
    catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new Error("Geen verbinding met de server. Je invoer blijft behouden; probeer opnieuw.");
    }
    if (response.status === 401) { logout(); navigate("/login", { replace: true }); throw new Error("Je sessie is verlopen. Log opnieuw in."); }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : null;
      throw new Error(validation || data?.message || (response.status === 413 ? "Dit bestand is te groot voor de server." : response.status === 429 ? "Te veel aanvragen. Probeer het over een minuut opnieuw." : "De aanvraag kon niet worden verwerkt."));
    }
    return response;
  }, [apiFetch, logout, navigate]);
}
export const jsonRequest = (method: string, data: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Er ging iets mis. Probeer het opnieuw.";
