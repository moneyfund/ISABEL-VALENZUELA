"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ClipboardList,
  Copy, FileCheck2, LockKeyhole, Phone, Printer, RefreshCw, ShieldCheck, AlertCircle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/lib/usePublic";
import { db } from "@/lib/firebase";
import { normalizeGuidePhone, submitServiceGuideRequest } from "@/lib/guide-requests";
import { whatsappUrl } from "@/lib/social";
import {
  buildServiceGuide, guideCatalog, serviceAnswerDisplay, serviceAnswerValid,
  serviceGuideConfig, type ServiceAnswers, type ServiceField, type ServiceGuideType
} from "@/lib/guia-servicios";

const formats = ["Tus datos","El inmueble","Detalles del caso","Tu guía"];

export default function ServiceGuideForm({kind}:{kind:ServiceGuideType}) {
  const config=serviceGuideConfig[kind];
  const {site}=useSiteContent();
  const [stage,setStage]=useState(0);
  const [firstName,setFirstName]=useState("");
  const [lastName,setLastName]=useState("");
  const [phone,setPhone]=useState("");
  const [answers,setAnswers]=useState<ServiceAnswers>({});
  const [consent,setConsent]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  const [reference,setReference]=useState("");
  const [copied,setCopied]=useState(false);
  const fields=config.fields;
  const results=buildServiceGuide(kind,answers);
  const answersShown=serviceAnswerDisplay(kind,answers);

  function updateField(key:string,value:string) {
    setAnswers(prev=>({...prev,[key]:value}));
    setError("");
  }

  const complete=stage===0
    ? firstName.trim().length>=2 && firstName.trim().length<=60
      && lastName.trim().length>=2 && lastName.trim().length<=60 && normalizeGuidePhone(phone)!==null
    : stage===1 || stage===2
      ? fields.filter(field=>field.step===stage).every(field=>
          (field.optional && !answers[field.key]?.trim())
          || Boolean(answers[field.key]?.trim())
        )
      : true;

  async function nextStep(){
    if(sending || !complete)return;
    if(stage!==2){setStage(s=>s+1);window.scrollTo({top:180,behavior:"smooth"});return;}
    if(!consent){setError("Debés autorizar el envío para recibir tu guía.");return;}
    if(!serviceAnswerValid(kind,answers)){
      setError("Revisá las respuestas y los valores ingresados.");
      return;
    }
    if(!db){setError("El servicio de consultas no está conectado. Contactá a Isabel directamente.");return;}
    setSending(true);setError("");
    try{
      const code=await submitServiceGuideRequest(db,kind,firstName,lastName,phone,answers,consent);
      setReference(code);
      setStage(3);
      window.scrollTo({top:180,behavior:"smooth"});
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudo enviar la solicitud. Intentá nuevamente.");
    }finally{setSending(false);}
  }

  function restart(){
    setStage(0);setFirstName("");setLastName("");setPhone("");
    setAnswers({});setConsent(false);setReference("");setError("");setCopied(false);
  }
  function copyText(){
    return [
      "GUÍA DE "+config.categoryLabel.toUpperCase()+" | ISABEL VALENZUELA",
      "Nombre: "+firstName.trim()+" "+lastName.trim(),
      "Celular: "+(normalizeGuidePhone(phone)||""),
      "Referencia: "+reference,
      "",...answersShown.map(a=>a.label+": "+a.value),
      "",...results.groups.flatMap(g=>[g.title.toUpperCase(),...g.items.map(item=>"- "+item.text+(item.detail?": "+item.detail:"")),""]),
      "PASOS",...results.steps.map((step,i)=>(i+1)+". "+step),
      "RECOMENDACIONES",...results.warnings,
      "Orientación general, sujeta a revisión jurídica, municipal y contractual según el caso."
    ].join("\n");
  }
  async function copySummary(){
    try{await navigator.clipboard.writeText(copyText());setCopied(true);}catch{setCopied(false);}
  }
  const wa=whatsappUrl(site.whatsapp,
    "Hola Isabel. Soy "+firstName.trim()+" "+lastName.trim()+". Completé la guía "+config.categoryLabel.toLowerCase()+
    " y mi referencia es "+reference+". Podés revisar mis respuestas en Guías recibidas. Quisiera conversar sobre mi caso.");

  function fieldInput(field:ServiceField) {
    const value=answers[field.key]||"";
    if(field.input==="choice"){
      return <div className="purchase-choices purchase-choices--compact guide-fields__choices" role="group" aria-label={field.label}>
        {field.options?.map(option=><button key={option.value} type="button" aria-pressed={value===option.value}
          className={`purchase-choice ${value===option.value?"purchase-choice--active":""}`}
          onClick={()=>updateField(field.key,option.value)}>
          <span className="purchase-choice__tick">{value===option.value&&<Check size={15}/>}</span>
          <strong>{option.title}</strong>
        </button>)}
      </div>;
    }
    return <div className="guide-fields__input">
      <input
        id={field.key}
        inputMode={field.input==="text"?"text":"decimal"}
        type={field.input==="text"?"text":"number"}
        min={field.input==="text"?undefined:1}
        step={field.input==="text"?undefined:"any"}
        max={field.input==="text"?120:100000000}
        maxLength={field.input==="text"?120:undefined}
        autoComplete="off"
        value={value} placeholder={field.placeholder||""}
        onChange={e=>updateField(field.key,e.target.value)}
      />
      {field.hint&&<small>{field.hint}</small>}
    </div>;
  }

  return <main className="purchase-page">
    <Navigation/>
    <section className="purchase-hero guide-subhero">
      <div className="container purchase-hero__inner">
        <div>
          <p className="purchase-eyebrow"><span/>GUÍAS INMOBILIARIAS</p>
          <h1>{config.heading}</h1>
          <p>{config.subtitle}</p>
          <div className="purchase-hero__meta">
            <span><ShieldCheck size={17}/> Información orientativa</span>
            <span><LockKeyhole size={17}/> Envío privado con autorización</span>
          </div>
        </div>
        <div className="purchase-hero__seal" aria-hidden="true"><img src="/isabel-emblema.svg" alt=""/><span>ISABEL VALENZUELA</span></div>
      </div>
    </section>
    <section className="purchase-body">
      <div className="container">
        <Link href="/guias" className="guide-back-link"><ArrowLeft size={16}/> Volver a las cuatro guías</Link>
      </div>
      <div className="container purchase-shell">
        <aside className="purchase-sidebar">
          <div className="purchase-sidebar__head"><span>{config.title.toUpperCase()}</span><strong>Tu ruta paso a paso</strong></div>
          <ol className="purchase-progress">{formats.map((title,i)=><li key={title} className={i===stage?"purchase-progress__active":i<stage?"purchase-progress__done":""}>
            <span>{i<stage?<Check size={14}/>:String(i+1).padStart(2,"0")}</span>
            <div><strong>{i===1?config.stepTitles[0]:i===2?config.stepTitles[1]:title}</strong><small>{i<stage?"Completado":i===stage?"Paso actual":"Pendiente"}</small></div>
          </li>)}</ol>
          <div className="purchase-sidebar__note"><ShieldCheck size={23}/><p>Al finalizar guardaremos tus respuestas con tu autorización. Isabel podrá revisar la consulta y contactarte sin repetir las preguntas.</p></div>
        </aside>
        <div className="purchase-main">
          {stage<3?<div className="purchase-question-panel">
            <header className="purchase-question-head">
              <span>PASO {String(stage+1).padStart(2,"0")} DE 03</span>
              <div className="purchase-progressbar"><span style={{width:`${((stage+1)/3)*100}%`}}/></div>
              <h2>{stage===0?"Primero, tus datos.":stage===1?config.stepTitles[0]:config.stepTitles[1]}</h2>
              <p>{stage===0?"Solo necesitamos cómo llamarte y un celular para dar seguimiento.":stage===1?"Seleccioná las opciones que describan mejor tu necesidad.":"Una última información para preparar una guía útil."}</p>
            </header>
            <div className="purchase-stage">
              {stage===0&&<div className="purchase-field">
                <h3>Información de contacto</h3>
                <div className="purchase-name-row">
                  <label><span>Nombre *</span><input value={firstName} maxLength={60} autoComplete="given-name" placeholder="Tu nombre" onChange={e=>setFirstName(e.target.value)}/></label>
                  <label><span>Apellido *</span><input value={lastName} maxLength={60} autoComplete="family-name" placeholder="Tu apellido" onChange={e=>setLastName(e.target.value)}/></label>
                  <label className="purchase-name-row__phone"><span>Celular *</span><input type="tel" maxLength={24} autoComplete="tel" value={phone} placeholder="+505 8888 8888" onChange={e=>setPhone(e.target.value)}/><small>Con código de país. Para Nicaragua bastan ocho dígitos.</small></label>
                </div>
              </div>}
              {(stage===1||stage===2)&&fields.filter(f=>f.step===stage).map(field=><div className="purchase-field" key={field.key}>
                <h3>{field.label} {field.optional&&<span>(opcional)</span>}</h3>
                {fieldInput(field)}
              </div>)}
              {stage===2&&<>
                <label className="purchase-consent">
                  <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
                  <span>Autorizo que Isabel Valenzuela guarde mi nombre, apellido, celular y respuestas para revisar mi solicitud y contactarme por llamada o WhatsApp, aunque yo no escriba primero. Solo las cuentas administradoras autorizadas podrán leerla. Puedo solicitar la eliminación de la consulta.</span>
                </label>
                <p className="purchase-privacy"><LockKeyhole size={16}/> Tus respuestas se guardan en Firestore solo si pulsás Enviar guía. Los resultados aparecen únicamente tras confirmarse el envío.</p>
              </>}
            </div>
            {error&&<p className="purchase-submit-error" role="alert">{error}</p>}
            <footer className="purchase-panel-actions">
              {stage>0?<button type="button" className="purchase-back" onClick={()=>{setStage(x=>x-1);setError("");}}><ArrowLeft size={16}/> Anterior</button>:<Link href="/guias" className="purchase-back"><ArrowLeft size={16}/> Ver guías</Link>}
              <button type="button" className="purchase-next" disabled={!complete||sending||(stage===2&&!consent)} onClick={()=>void nextStep()}>
                {stage===2?(sending?"Enviando...":"Enviar guía"):"Continuar"} <ArrowRight size={17}/>
              </button>
            </footer>
          </div>:<div className="purchase-results" aria-live="polite">
            <div className="purchase-results__header">
              <span><FileCheck2 size={17}/>GUÍA PERSONALIZADA</span>
              <h2>{config.title}</h2>
              <p>{firstName.trim()}, prepará estos pasos para tu caso.</p>
              <div className="purchase-reference"><CheckCircle2 size={18}/> Consulta registrada con éxito. Código <strong>{reference}</strong>. Usalo cuando hables con Isabel.</div>
              <div className="purchase-results__actions">
                <button type="button" onClick={()=>void copySummary()}><Copy size={16}/>{copied?"Copiado":"Copiar guía"}</button>
                <button type="button" onClick={()=>window.print()}><Printer size={16}/>Imprimir</button>
                <button type="button" onClick={restart}><RefreshCw size={16}/>Empezar otra</button>
              </div>
            </div>
            {results.warnings.length>0&&<div className="purchase-alerts"><h3><AlertCircle size={19}/> Recomendaciones para tu caso</h3>{results.warnings.map(w=><p key={w}>{w}</p>)}</div>}
            <div className="purchase-result-sections">
              {results.groups.map(group=><section key={group.title} className="purchase-result-card">
                <h3><ClipboardList size={20}/>{group.title}</h3>
                <ul>{group.items.map(item=><li key={item.text}><CheckCircle2 size={17}/><div><strong>{item.text}</strong>{item.detail&&<p>{item.detail}</p>}</div></li>)}</ul>
              </section>)}
              <section className="purchase-result-card purchase-result-card--steps">
                <h3><ClipboardList size={20}/>Pasos recomendados</h3>
                <ol>{results.steps.map((step,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></li>)}</ol>
              </section>
            </div>
            <div className="purchase-advisor">
              <div><span>ASESORÍA PERSONAL</span><h3>Isabel ya puede ver tu consulta.</h3><p>Al comunicarte, mencioná tu referencia. Así evitamos volver a preguntarte lo mismo.</p></div>
              {wa?<a href={wa} target="_blank" rel="noopener noreferrer"><Phone size={18}/> Contactar a Isabel <ArrowUpRight size={17}/></a>:<Link href="/contacto">Contactar a Isabel <ArrowUpRight size={17}/></Link>}
            </div>
          </div>}
          <section className="purchase-sources">
            <h3>Información orientativa</h3>
            <p>Esta guía está adaptada a situaciones habituales en Nicaragua y no representa aprobación, avalúo ni asesoramiento jurídico. Los requisitos finales dependen de la documentación, el uso del inmueble y las condiciones que acuerden las partes. Confirmá todo con un profesional competente antes de firmar o entregar dinero.</p>
            <div className="purchase-sources__links">
              <a href="https://www.poderjudicial.gob.ni/pjupload/registros/pdf/rgsereregistro.pdf" target="_blank" rel="noopener noreferrer">Registro Público <ArrowUpRight size={13}/></a>
              <a href="https://www.oas.org/DIL/ESP/Codigo_Civil_Nicaragua.pdf" target="_blank" rel="noopener noreferrer">Código Civil: arrendamiento <ArrowUpRight size={13}/></a>
            </div>
          </section>
        </div>
      </div>
    </section>
    <Footer site={site}/>
  </main>;
}
