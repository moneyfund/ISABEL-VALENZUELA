"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { normalizeGuidePhone, submitGuideRequest } from "@/lib/guide-requests";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, CheckCircle2,
  ClipboardList, Copy, FileCheck2, FileText, Home, Landmark, LockKeyhole,
  MapPin, Printer, RefreshCw, ShieldCheck, Wallet, AlertCircle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/lib/usePublic";
import { whatsappUrl } from "@/lib/social";
import {
  buildPurchaseGuide, documentOptions, incomeOptions, initialAnswers,
  paymentLabels, paymentOptions, propertyLabels, propertyOptions, residenceOptions,
  type GuideAnswers, type ChecklistEntry
} from "@/lib/guia-compra";

type ChoiceItem<T extends string> = {
  value: T; title: string; description?: string;
};

function ChoiceGrid<T extends string>({
  items, value, onChange, compact = false
}: {
  items: readonly ChoiceItem<T>[];
  value: T | null;
  onChange: (next: T) => void;
  compact?: boolean;
}) {
  return <div className={compact ? "purchase-choices purchase-choices--compact" : "purchase-choices"} role="group">
    {items.map(option => <button type="button" key={option.value} onClick={() => onChange(option.value)}
      className={`purchase-choice ${value === option.value ? "purchase-choice--active" : ""}`}
      aria-pressed={value === option.value}>
      <span className="purchase-choice__tick">{value === option.value && <Check size={16} aria-hidden="true" />}</span>
      <strong>{option.title}</strong>
      {option.description && <small>{option.description}</small>}
    </button>)}
  </div>;
}

function Requirements({ title, items, icon }: { title: string; items: ChecklistEntry[]; icon: React.ReactNode }) {
  return <section className="purchase-result-card">
    <h3>{icon}{title}</h3>
    <ul>{items.map(item => <li key={item.text}><CheckCircle2 size={17} aria-hidden="true" /><div><strong>{item.text}</strong>{item.detail && <p>{item.detail}</p>}</div></li>)}</ul>
  </section>;
}

const stageNames = ["Forma de pago", "Propiedad", "Tu situación", "Tu guía"];

export default function PurchaseGuidePage() {
  const { site } = useSiteContent();
  const [answers, setAnswers] = useState<GuideAnswers>(initialAnswers);
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const result = buildPurchaseGuide(answers);

  function choose<K extends keyof GuideAnswers>(key: K, value: GuideAnswers[K]) {
    setAnswers(current => ({ ...current, [key]: value }));
    setCopied(false);
    setSendError("");
  }

  const canNext = stage === 0
    ? answers.payment !== null && firstName.trim().length >= 2 && lastName.trim().length >= 2 && firstName.trim().length <= 60 && lastName.trim().length <= 60 && normalizeGuidePhone(phone) !== null
    : stage === 1
      ? answers.property !== null && answers.documents !== null && answers.identified !== null
      : stage === 2
        ? answers.income !== null && answers.residence !== null
        : true;

  const caseLabel = answers.payment && answers.property
    ? `Compra ${paymentLabels[answers.payment]} de ${propertyLabels[answers.property]}`
    : "Guía personalizada";

  const whatsapp = whatsappUrl(site.whatsapp,
    `Hola Isabel, soy ${firstName.trim()} ${lastName.trim()}. Completé la guía de compra sobre ${caseLabel.toLowerCase()}. Mi código de consulta es ${reference || "pendiente"}. Podés revisar mis respuestas en el panel de administración. Quisiera recibir orientación.`);

  async function sendGuide() {
    if (sending || !canNext || stage !== 2) return;
    if (!db) {
      setSendError("El sistema de consultas no está conectado. Intentá nuevamente o comunicate directamente con Isabel.");
      return;
    }
    setSending(true);
    setSendError("");
    try {
      const code = await submitGuideRequest(db, firstName, lastName, phone, answers, consent);
      setReference(code);
      setStage(3);
      window.scrollTo({ top: 230, behavior: "smooth" });
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "No fue posible enviar la consulta. Probá nuevamente.");
    } finally {
      setSending(false);
    }
  }

  function summaryText() {
    return [
      "GUÍA ORIENTATIVA DE COMPRA DE PROPIEDAD | ISABEL VALENZUELA",
      `Solicitante: ${firstName.trim()} ${lastName.trim()}`,
      `Celular de contacto: ${normalizeGuidePhone(phone) || "No proporcionado"}`,
      `Referencia: ${reference || "sin enviar"}`,
      caseLabel, "Nicaragua. Requisitos sujetos al caso y a revisión profesional.",
      "", "DOCUMENTOS DEL COMPRADOR",
      ...result.personal.map(item => "- " + item.text + (item.detail ? ": " + item.detail : "")),
      "", "DOCUMENTOS Y VERIFICACIONES DE LA PROPIEDAD",
      ...result.property.map(item => "- " + item.text + (item.detail ? ": " + item.detail : "")),
      "", answers.payment === "credito" ? "DOCUMENTOS PARA FINANCIAMIENTO" : "PREPARACIÓN DE PAGO DE CONTADO",
      ...result.finance.map(item => "- " + item.text + (item.detail ? ": " + item.detail : "")),
      "", "PASOS", ...result.steps.map((text, i) => `${i + 1}. ${text}`),
      "", "ADVERTENCIAS", ...result.warnings.map(x => "- " + x),
      "", "Orientación general; no constituye aprobación bancaria ni asesoramiento legal.",
      "Referencias: Banco LAFISE, Banpro, DGI y Poder Judicial de Nicaragua."
    ].join("\n");
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  function restart() {
    setAnswers(initialAnswers);
    setFirstName("");
    setLastName("");
    setPhone("");
    setConsent(false);
    setReference(null);
    setSendError("");
    setStage(0);
    setCopied(false);
  }

  return <main className="purchase-page">
    <Navigation/>
    <section className="purchase-hero">
      <div className="container purchase-hero__inner">
        <div>
          <p className="purchase-eyebrow"><span />GUÍA DE COMPRA EN NICARAGUA</p>
          <h1>Comprá con <em>más claridad.</em></h1>
          <p>Respondé unas preguntas y conocé qué revisar, qué documentos reunir y cuáles son los próximos pasos.</p>
          <div className="purchase-hero__meta"><span><ShieldCheck size={17}/> Información orientativa</span><span><LockKeyhole size={17}/> Envío privado y con tu autorización</span></div>
        </div>
        <div className="purchase-hero__seal" aria-hidden="true"><img src="/isabel-emblema.svg" alt=""/><span>DECISIONES INFORMADAS</span></div>
      </div>
    </section>

    <section className="purchase-body">
      <div className="container purchase-shell">
        <aside className="purchase-sidebar">
          <div className="purchase-sidebar__head"><span>GUÍA INTERACTIVA</span><strong>Tu ruta de compra</strong></div>
          <ol className="purchase-progress">{stageNames.map((name, index) => <li key={name} className={index === stage ? "purchase-progress__active" : index < stage ? "purchase-progress__done" : ""}>
            <span>{index < stage ? <Check size={14}/> : String(index + 1).padStart(2, "0")}</span><div><strong>{name}</strong><small>{index < stage ? "Completado" : index === stage ? "Paso actual" : "Pendiente"}</small></div>
          </li>)}</ol>
          <div className="purchase-sidebar__note"><ShieldCheck size={23}/><p>Esta guía guarda tu nombre, celular y respuestas para que Isabel pueda contactarte sin repetir las preguntas.</p></div>
        </aside>

        <div className="purchase-main">
          {stage < 3 ? <div className="purchase-question-panel">
            <header className="purchase-question-head">
              <span>PASO {String(stage + 1).padStart(2, "0")} DE 03</span>
              <div className="purchase-progressbar"><span style={{ width: `${((stage + 1) / 3) * 100}%` }}/></div>
              <h2>{stage === 0 ? "¿Cómo pensás comprar?" : stage === 1 ? "Contanos sobre la propiedad." : "¿Cuál es tu situación?"}</h2>
              <p>{stage === 0 ? "Elegí tu forma de pago para adaptar la guía." : stage === 1 ? "El tipo de inmueble y su documentación cambian las verificaciones." : "El origen de los ingresos influye especialmente cuando solicitás crédito."}</p>
            </header>

            {stage === 0 && <div className="purchase-stage">
              <div className="purchase-field">
                <h3>¿Cómo te llamás?</h3>
                <div className="purchase-name-row">
                  <label><span>Nombre <b>*</b></span><input required autoComplete="given-name" maxLength={60} minLength={2} value={firstName} onChange={e => { setFirstName(e.target.value); setSendError(""); }} placeholder="Tu nombre"/></label>
                  <label><span>Apellido <b>*</b></span><input required autoComplete="family-name" maxLength={60} minLength={2} value={lastName} onChange={e => { setLastName(e.target.value); setSendError(""); }} placeholder="Tu apellido"/></label>
                  <label className="purchase-name-row__phone"><span>Número de celular <b>*</b></span><input required type="tel" inputMode="tel" autoComplete="tel" maxLength={24} value={phone} onChange={e => { setPhone(e.target.value); setSendError(""); }} placeholder="+505 8888 8888" aria-describedby="guide-phone-hint" /><small id="guide-phone-hint">Con código de país. Si escribís 8 dígitos, agregamos +505 automáticamente.</small></label>
                </div>
              </div>
              <div className="purchase-field"><h3>Forma de pago</h3><ChoiceGrid items={paymentOptions} value={answers.payment} onChange={value => choose("payment", value)}/></div>
              <div className="purchase-tip"><BadgeCheck size={19}/> Sea con crédito o contado, siempre se debe revisar la situación jurídica del inmueble.</div>
            </div>}

            {stage === 1 && <div className="purchase-stage">
              <div className="purchase-field"><h3>Tipo de propiedad</h3><ChoiceGrid items={propertyOptions} value={answers.property} onChange={value => choose("property", value)} compact/></div>
              <div className="purchase-field"><h3>¿Ya encontraste una propiedad?</h3><div className="purchase-inline">
                <button type="button" className={answers.identified === true ? "purchase-inline__active" : ""} aria-pressed={answers.identified === true} onClick={() => choose("identified", true)}>Sí</button>
                <button type="button" className={answers.identified === false ? "purchase-inline__active" : ""} aria-pressed={answers.identified === false} onClick={() => choose("identified", false)}>Todavía no</button>
              </div></div>
              <div className="purchase-field"><h3>¿La propiedad tiene escritura inscrita?</h3><ChoiceGrid items={documentOptions} value={answers.documents} onChange={value => choose("documents", value)} compact/></div>
            </div>}

            {stage === 2 && <div className="purchase-stage">
              <div className="purchase-field"><h3>Tipo de ingresos</h3><ChoiceGrid items={incomeOptions} value={answers.income} onChange={value => choose("income", value)} compact/></div>
              <div className="purchase-field"><h3>Situación de residencia</h3><ChoiceGrid items={residenceOptions} value={answers.residence} onChange={value => choose("residence", value)} compact/></div>
              <div className="purchase-field"><h3>Presupuesto estimado <span>(opcional)</span></h3>
                <div className="purchase-money-row">
                  <label><span>Precio estimado en USD</span><input type="number" min="0" max="100000000" step="any" inputMode="decimal" placeholder="Ej. 75000" value={answers.price} onChange={e => choose("price", e.target.value)}/></label>
                  {answers.payment === "credito" && <label><span>Ahorro para prima en USD</span><input type="number" min="0" max="100000000" step="any" inputMode="decimal" placeholder="Ej. 15000" value={answers.savings} onChange={e => choose("savings", e.target.value)}/></label>}
                </div>
              </div>
              <label className="purchase-consent">
                <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); setSendError(""); }} />
                <span>Autorizo enviar y guardar mi nombre, apellido, número de celular, selección de inmueble, forma de pago, ingresos, residencia y presupuesto (si lo indiqué) para que Isabel Valenzuela pueda revisar mi consulta y contactarme por llamada o WhatsApp, aunque yo no le escriba primero. Comprendo que será visible solamente para las dos cuentas administradoras autorizadas y que puedo solicitar su eliminación.</span>
              </label>
              <p className="purchase-privacy"><LockKeyhole size={16}/> La guía aparece cuando Firestore confirma el registro. No pedimos cédula ni datos bancarios.</p>
            </div>}

            {sendError && <p className="purchase-submit-error" role="alert">{sendError}</p>}
            <footer className="purchase-panel-actions">
              {stage > 0 ? <button type="button" className="purchase-back" onClick={() => setStage(step => step - 1)}><ArrowLeft size={17}/> Anterior</button> : <Link href="/" className="purchase-back"><ArrowLeft size={17}/> Volver al inicio</Link>}
              <button type="button" className="purchase-next" disabled={!canNext || sending || (stage === 2 && !consent)} onClick={() => {
                if (stage === 2) { void sendGuide(); }
                else { setStage(step => step + 1); window.scrollTo({ top: 230, behavior: "smooth" }); }
              }}>
                {stage === 2 ? (sending ? "Enviando consulta..." : "Enviar guía") : "Continuar"} <ArrowRight size={18}/>
              </button>
            </footer>
          </div> : <div className="purchase-results" aria-live="polite">
            <div className="purchase-results__header">
              <span><FileCheck2 size={17}/> RESULTADO PERSONALIZADO</span>
              <h2>Tu guía de compra</h2>
              <p>{caseLabel} en Nicaragua.</p>
              <div className="purchase-reference"><CheckCircle2 size={18}/> ¡Consulta enviada! {firstName.trim()}, tu referencia es <strong>{reference}</strong>. Enviala por WhatsApp para que Isabel localice tus respuestas.</div>
              <div className="purchase-results__actions">
                <button onClick={() => void copyResult()} type="button"><Copy size={17}/>{copied ? "Copiado" : "Copiar guía"}</button>
                <button onClick={() => window.print()} type="button"><Printer size={17}/>Imprimir</button>
                <button onClick={restart} type="button"><RefreshCw size={17}/>Reiniciar</button>
              </div>
            </div>
            {result.warnings.length > 0 && <div className="purchase-alerts" role="status">
              <h3><AlertCircle size={20}/> Atención a tu caso</h3>
              {result.warnings.map((text,i) => <p key={i}>{text}</p>)}
            </div>}
            <div className="purchase-result-sections">
              <Requirements title="Documentos del comprador" items={result.personal} icon={<FileText size={20}/>}/>
              <Requirements title="Revisión de la propiedad" items={result.property} icon={<Home size={20}/>}/>
              <Requirements title={answers.payment === "credito" ? "Financiamiento y comprobantes" : "Preparación para pago de contado"} items={result.finance} icon={answers.payment === "credito" ? <Landmark size={20}/> : <Wallet size={20}/>}/>
              <section className="purchase-result-card purchase-result-card--steps">
                <h3><ClipboardList size={20}/>Pasos recomendados</h3>
                <ol>{result.steps.map((text,i) => <li key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{text}</p></li>)}</ol>
              </section>
            </div>
            <div className="purchase-advisor">
              <div><span>ASESORÍA PERSONAL</span><h3>Isabel te ayuda a dar el siguiente paso.</h3><p>Esta guía es un punto de partida. Revisemos juntos los detalles de tu propiedad.</p></div>
              {whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer">Hablar con Isabel <ArrowUpRight size={19}/></a> : <Link href="/contacto">Contactar a Isabel <ArrowUpRight size={19}/></Link>}
            </div>
          </div>}

          <section className="purchase-sources">
            <h3>Información y alcance</h3>
            <p>Orientación general para Nicaragua, consultada en noviembre de 2026. La entidad financiera define requisitos, prima, tasa y aprobación según cada solicitud. Un notario debe revisar el caso y la documentación antes de firmar o entregar anticipos. La guía no garantiza elegibilidad bancaria ni sustituye asesoría legal.</p>
            <div className="purchase-sources__links">
              <a href="https://www.lafise.com/blb/banca-personal/prestamos/prestamo-hipotecario/" target="_blank" rel="noopener noreferrer">LAFISE: crédito hipotecario <ArrowUpRight size={14}/></a>
              <a href="https://www.banprogrupopromerica.com.ni/banca-de-personas/creditos/credito-hipotecario/" target="_blank" rel="noopener noreferrer">Banpro: requisitos de crédito <ArrowUpRight size={14}/></a>
              <a href="https://www.dgi.gob.ni/FAQ/otros_tramites.htm" target="_blank" rel="noopener noreferrer">DGI: cambio de propietario <ArrowUpRight size={14}/></a>
              <a href="https://www.poderjudicial.gob.ni/pjupload/registros/pdf/rgsereregistro.pdf" target="_blank" rel="noopener noreferrer">Poder Judicial: Registro Público <ArrowUpRight size={14}/></a>
            </div>
          </section>
        </div>
      </div>
    </section>
    <Footer site={site}/>
  </main>;
}
