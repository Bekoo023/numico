import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, MessageCircle, Send, Sparkles } from "lucide-react";
import { errorMessage, jsonRequest, useAdministrationApi } from "./api";
import type { Message } from "./api";
import AssistantText from "./AssistantText";

export default function AdministrationChat({ from, to, revision, invalidPeriod }: { from: string; to: string; revision: number; invalidPeriod: boolean }) {
  const api = useAdministrationApi();
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasOlder, setHasOlder] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    void api("/administration/chat", { signal: controller.signal }).then(response => response.json()).then(data => {
      if (!controller.signal.aborted) { setMessages(data.messages); setHasOlder(data.has_older); }
    }).catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [api, retry]);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, busy]);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (busy || !question.trim() || loading || invalidPeriod) return;
    setBusy(true); setError("");
    try {
      const response = await api("/administration/chat", jsonRequest("POST", { message: question.trim(), from: from || null, to: to || null }));
      const data = await response.json();
      setMessages(previous => [...previous, ...data.messages]); setQuestion("");
    } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <section className="dash-card admin-chat" id="assistant">
    <div className="dash-section-heading"><div><p className="dash-eyebrow">DENKT MET JE MEE</p><h2><Sparkles size={19} /> Je administratie-assistent</h2></div><span className="dash-tag">Op basis van jouw bonnen</span></div>
    <p className="dash-muted">Stel vragen over je uitgaven, bonnetjes of btw. De assistent gebruikt je gecontroleerde gegevens en zoekt fiscale informatie bij officiële bronnen.</p>
    <div className="admin-chat-context">Periode: {from || "begin"} — {to || "geen einddatum"}. {revision > 0 ? "Nieuwe antwoorden gebruiken de bijgewerkte administratie." : "Nieuwe antwoorden gebruiken de actuele administratie."}</div>
    <div className="admin-chat-log" ref={log} role="log" aria-label="Gesprek met administratie-assistent" aria-live="polite">
      {loading && <p className="dash-muted">Gesprek ophalen…</p>}
      {hasOlder && <p className="dash-muted">Je ziet de laatste 50 berichten. Oudere berichten blijven opgeslagen.</p>}
      {!loading && !messages.length && <div className="admin-chat-welcome"><span className="dash-icon mint"><MessageCircle size={24} /></span><h3>Waar kan ik je mee helpen?</h3><p>Van een snelle uitgavencheck tot uitleg over je administratie.</p><div>{["Hoeveel heb ik uitgegeven?", "Welke bonnetjes moet ik nog controleren?", "Wanneer mag ik btw aftrekken?"].map(text => <button key={text} onClick={() => setQuestion(text)} className="admin-suggestion">{text}<ArrowUpRight size={14} /></button>)}</div></div>}
      {messages.map(message => <article key={message.id} className={`admin-message ${message.role}`}><strong>{message.role === "user" ? "Jij" : "Numico assistent"}</strong><div className="admin-message-text">{message.role === "assistant" ? <AssistantText text={message.content} /> : message.content}</div>{!!message.sources?.length && <div className="admin-sources">{message.sources.filter(source => source.url.startsWith("https://")).map(source => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.title}<ArrowUpRight size={12} /></a>)}</div>}</article>)}
      {busy && <p className="admin-thinking" role="status">Je administratie wordt bekeken. Een antwoord met bronnen kan even duren…</p>}<div ref={bottom} />
    </div>
    {error && <p className="admin-warning" role="alert">{error} {!messages.length && <button type="button" onClick={() => setRetry(value => value + 1)}>Gesprek opnieuw laden</button>}</p>}
    <form className="admin-chat-form" onSubmit={send}><label className="admin-sr-only" htmlFor="assistant-question">Je vraag aan de assistent</label><textarea id="assistant-question" rows={2} value={question} maxLength={4000} disabled={busy} onChange={e => setQuestion(e.target.value)} placeholder="Stel een vraag over je administratie…" /><button className="dash-button admin-primary" type="submit" disabled={busy || loading || invalidPeriod || !question.trim()}><Send size={16} /><span>{busy ? "Bezig…" : "Versturen"}</span></button></form>
    <p className="admin-footnote">De assistent helpt je administratie begrijpen. Laat fiscale keuzes en je aangifte controleren door je boekhouder.</p>
  </section>;
}
