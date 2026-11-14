"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ClipboardList, Clock3, Eye, MessageCircle,
  Phone, Search, Trash2, X
} from "lucide-react";
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  type AnyGuideRequest, type GuideRequestStatus,
  guideLabels, guideReference, isServiceGuideRequest,
  localDateTime, normalizeGuidePhone, requestStatuses
} from "@/lib/guide-requests";
import { guideCatalog, serviceAnswerDisplay, type GuideType } from "@/lib/guia-servicios";

type StatusFilter = "todas" | GuideRequestStatus;
type GuideFilter = "todas" | GuideType;
const money = (n:number|null|undefined)=>n==null?"No indicado":
  new Intl.NumberFormat("es-NI",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);

function guideKind(item:AnyGuideRequest):GuideType{
  return isServiceGuideRequest(item) ? item.guideType : "compra";
}

function guideDetails(item:AnyGuideRequest):{label:string;value:string}[]{
  if(isServiceGuideRequest(item)){
    const a=Object.fromEntries(Object.entries(item.answers||{}).map(([k,v])=>[k,v==null?"":String(v)]));
    return serviceAnswerDisplay(item.guideType,a);
  }
  return [
    {label:"Forma de pago",value:guideLabels.payment[item.payment]||"Sin información"},
    {label:"Propiedad",value:guideLabels.property[item.property]||"Sin información"},
    {label:"Tipo de ingresos",value:guideLabels.income[item.income]||"Sin información"},
    {label:"Residencia",value:guideLabels.residence[item.residence]||"Sin información"},
    {label:"¿Ya encontró propiedad?",value:item.identified?"Sí":"Todavía no"},
    {label:"Escritura",value:guideLabels.documents[item.documents]||"Sin información"},
    {label:"Precio estimado",value:money(item.price)},
    {label:"Ahorro para prima",value:money(item.savings)}
  ];
}

export default function GuideRequestsPanel(){
  const [requests,setRequests]=useState<AnyGuideRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [term,setTerm]=useState("");
  const [statusFilter,setStatusFilter]=useState<StatusFilter>("todas");
  const [guideFilter,setGuideFilter]=useState<GuideFilter>("todas");
  const [selected,setSelected]=useState<string|null>(null);
  const [busy,setBusy]=useState<string|null>(null);

  useEffect(()=>{
    if(!db){setLoading(false);setError("Firebase no está configurado.");return;}
    const q=query(collection(db,"purchase_requests"),orderBy("createdAt","desc"),limit(150));
    return onSnapshot(q,snapshot=>{
      setRequests(snapshot.docs.map(d=>({...d.data(),id:d.id} as AnyGuideRequest)));
      setLoading(false);setError("");
    },()=>{
      setLoading(false);
      setError("No se pudieron cargar las guías. Revisá las reglas publicadas de Firestore.");
    });
  },[]);

  const filtered=useMemo(()=>{
    const q=term.trim().toLocaleLowerCase("es");
    return requests.filter(item=>{
      const kind=guideKind(item);
      const haystack=[
        item.firstName,item.lastName,item.phone||"",guideReference(item.id),
        guideCatalog[kind].title,
        ...guideDetails(item).map(field=>field.value)
      ].join(" ").toLocaleLowerCase("es");
      return (statusFilter==="todas"||item.status===statusFilter)
        && (guideFilter==="todas"||kind===guideFilter)
        && (!q||haystack.includes(q));
    });
  },[requests,term,statusFilter,guideFilter]);

  const newCount=requests.filter(item=>item.status==="nuevo").length;

  async function updateStatus(item:AnyGuideRequest,status:GuideRequestStatus){
    if(!db||busy)return;
    setBusy(item.id);setError("");
    try{await updateDoc(doc(db,"purchase_requests",item.id),{status});}
    catch{setError("No fue posible actualizar el estado.");}
    finally{setBusy(null);}
  }

  async function remove(item:AnyGuideRequest){
    if(!db||busy||!window.confirm(
      `¿Eliminar definitivamente la consulta ${guideReference(item.id)} de ${item.firstName} ${item.lastName}? No se puede deshacer.`
    ))return;
    setBusy(item.id);setError("");
    try{await deleteDoc(doc(db,"purchase_requests",item.id));setSelected(null);}
    catch{setError("No se pudo eliminar la consulta.");}
    finally{setBusy(null);}
  }

  return <section className="admin__content guide-inbox">
    <div className="admin__section-header">
      <div><p>Consultas de compra, venta y renta enviadas desde las cuatro guías.</p><h2>Guías recibidas</h2></div>
      <span className="guide-inbox__count"><MessageCircle size={17}/>{newCount} {newCount===1?"nueva":"nuevas"}</span>
    </div>
    <div className="guide-inbox__intro">
      <ClipboardList size={23}/>
      <p>Identificá el tipo de consulta y su código <strong>IV-XXXXXXXX</strong>. Si el cliente escribe por WhatsApp, buscá esa referencia para revisar todas sus respuestas. Horarios en Nicaragua (UTC-6).</p>
    </div>
    {error&&<div className="guide-inbox__error" role="alert"><AlertTriangle size={17}/>{error}</div>}
    <div className="guide-inbox__toolbar">
      <label><Search size={17}/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Buscar nombre, celular, zona o referencia..." aria-label="Buscar solicitudes"/></label>
      <select value={guideFilter} onChange={e=>setGuideFilter(e.target.value as GuideFilter)} aria-label="Filtrar por tipo de guía">
        <option value="todas">Las cuatro guías</option>
        {(Object.keys(guideCatalog) as GuideType[]).map(id=><option key={id} value={id}>{guideCatalog[id].name}</option>)}
      </select>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as StatusFilter)} aria-label="Filtrar por estado">
        <option value="todas">Todos los estados</option>
        {requestStatuses.map(item=><option key={item.value} value={item.value}>{item.title}</option>)}
      </select>
    </div>
    <div className="guide-inbox__list">
      {loading&&<p className="guide-inbox__empty">Cargando consultas...</p>}
      {!loading&&!filtered.length&&<div className="guide-inbox__empty">
        <ClipboardList size={32}/><h3>No hay consultas con estos filtros</h3>
        <p>{requests.length?"Cambiá los filtros o el texto de búsqueda.":"Las nuevas solicitudes aparecerán aquí cuando los visitantes envíen sus guías."}</p>
      </div>}
      {filtered.map(item=>{
        const kind=guideKind(item);
        const details=guideDetails(item);
        return <article className="guide-inbox__card" key={item.id}>
          <div className="guide-inbox__card-content">
            <div className="guide-inbox__person">
              <span className="guide-inbox__ref">{guideReference(item.id)}</span>
              <span className="guide-inbox__category">{guideCatalog[kind].name}</span>
              <h3>{item.firstName} {item.lastName}</h3>
              <p><Clock3 size={14}/>{localDateTime(item.createdAt)}</p>
              {item.phone&&<a className="guide-inbox__phone" href={`tel:${normalizeGuidePhone(item.phone)||item.phone}`}><Phone size={14}/>{item.phone}</a>}
            </div>
            <div className="guide-inbox__summary">
              <span>{guideCatalog[kind].title}</span>
              <small>{details.slice(0,2).map(d=>d.value).join(" · ")}</small>
            </div>
            <div className="guide-inbox__controls">
              <label className="guide-inbox__status-label">Estado
                <select aria-label={`Estado de ${item.firstName} ${item.lastName}`} value={item.status||"nuevo"}
                  disabled={busy===item.id} onChange={e=>void updateStatus(item,e.target.value as GuideRequestStatus)}>
                  {requestStatuses.map(option=><option key={option.value} value={option.value}>{option.title}</option>)}
                </select>
              </label>
              <button className="guide-inbox__view" type="button" onClick={()=>setSelected(current=>current===item.id?null:item.id)}>
                {selected===item.id?<X size={17}/>:<Eye size={17}/>} {selected===item.id?"Cerrar":"Ver respuestas"}
              </button>
            </div>
          </div>
          {selected===item.id&&<div className="guide-inbox__detail">
            <div><span>Tipo de guía</span><strong>{guideCatalog[kind].title}</strong></div>
            <div><span>Celular de contacto</span><strong>{item.phone?
              <a className="guide-inbox__phone-link" href={`tel:${normalizeGuidePhone(item.phone)||item.phone}`}><Phone size={15}/>{item.phone} · Llamar</a>:
              "No registrado (consulta anterior)"}</strong></div>
            {details.map((detail,i)=><div key={i}><span>{detail.label}</span><strong>{detail.value}</strong></div>)}
            <div><span>Fecha y hora</span><strong>{localDateTime(item.createdAt)}</strong></div>
            <div><span>Autorización</span><strong>{item.consent?"Otorgada":"No registrada"}</strong></div>
            <div className="guide-inbox__detail-actions">
              <CheckCircle2 size={16}/><span>Consulta guardada en Firestore</span>
              <button disabled={busy===item.id} type="button" onClick={()=>void remove(item)}><Trash2 size={16}/>Eliminar consulta</button>
            </div>
          </div>}
        </article>;
      })}
    </div>
    {requests.length>=150&&<p className="guide-inbox__footnote">Se muestran las 150 consultas más recientes.</p>}
  </section>;
}
