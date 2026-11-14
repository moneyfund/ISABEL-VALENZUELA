"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, ClipboardList, Clock3, Eye, Search, Trash2,
  MessageCircle, AlertTriangle, X
} from "lucide-react";
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  type GuideRequestRecord, type GuideRequestStatus, guideLabels,
  guideReference, localDateTime, requestStatuses
} from "@/lib/guide-requests";

type Filter = "todas" | GuideRequestStatus;

export default function GuideRequestsPanel() {
  const [requests, setRequests] = useState<GuideRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!db) { setLoading(false); setError("Firebase no está configurado."); return; }
    const q = query(collection(db, "purchase_requests"), orderBy("createdAt", "desc"), limit(150));
    return onSnapshot(q, snapshot => {
      setRequests(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as GuideRequestRecord)));
      setLoading(false);
      setError("");
    }, () => {
      setLoading(false);
      setError("No se pudieron cargar las consultas. Verificá que hayas publicado las nuevas reglas de Firestore.");
    });
  }, []);

  const filtered = useMemo(() => {
    const q = term.trim().toLocaleLowerCase("es");
    return requests.filter(item => {
      const text = [item.firstName, item.lastName, guideReference(item.id),
        guideLabels.payment[item.payment], guideLabels.property[item.property]].join(" ").toLocaleLowerCase("es");
      return (filter === "todas" || item.status === filter) && (!q || text.includes(q));
    });
  }, [requests, term, filter]);

  const newCount = requests.filter(item => item.status === "nuevo").length;

  async function changeStatus(item: GuideRequestRecord, status: GuideRequestStatus) {
    if (!db || busy) return;
    setBusy(item.id); setError("");
    try {
      await updateDoc(doc(db, "purchase_requests", item.id), { status });
    } catch {
      setError("No fue posible actualizar el estado de la consulta.");
    } finally { setBusy(null); }
  }

  async function remove(item: GuideRequestRecord) {
    if (!db || busy || !window.confirm(
      `¿Eliminar definitivamente la consulta ${guideReference(item.id)} de ${item.firstName} ${item.lastName}? Esta acción no se puede deshacer.`
    )) return;
    setBusy(item.id); setError("");
    try {
      await deleteDoc(doc(db, "purchase_requests", item.id));
      setSelected(null);
    } catch {
      setError("No se pudo eliminar la consulta.");
    } finally { setBusy(null); }
  }

  return <section className="admin__content guide-inbox">
    <div className="admin__section-header">
      <div><p>Respuestas enviadas por los visitantes desde la guía de compra.</p><h2>Solicitudes de asesoría</h2></div>
      <span className="guide-inbox__count"><MessageCircle size={17}/> {newCount} {newCount === 1 ? "nueva" : "nuevas"}</span>
    </div>

    <div className="guide-inbox__intro"><ClipboardList size={23}/><p>Identificá cada consulta por su código <strong>IV-XXXXXXXX</strong>. Es el mismo que el cliente enviará al iniciar una conversación por WhatsApp. Horarios mostrados en Nicaragua (UTC-6).</p></div>
    {error && <div className="guide-inbox__error" role="alert"><AlertTriangle size={17}/>{error}</div>}

    <div className="guide-inbox__toolbar">
      <label><Search size={17} /><input value={term} onChange={e => setTerm(e.target.value)} placeholder="Buscar nombre o código IV..." aria-label="Buscar consultas"/></label>
      <select value={filter} onChange={e => setFilter(e.target.value as Filter)} aria-label="Filtrar por estado">
        <option value="todas">Todos los estados</option>
        {requestStatuses.map(option => <option key={option.value} value={option.value}>{option.title}</option>)}
      </select>
    </div>

    <div className="guide-inbox__list">
      {loading && <p className="guide-inbox__empty">Cargando consultas...</p>}
      {!loading && filtered.length === 0 && <div className="guide-inbox__empty"><ClipboardList size={32}/><h3>Sin consultas para mostrar</h3><p>{requests.length ? "Probá otros filtros." : "Las nuevas solicitudes aparecerán aquí cuando los visitantes envíen sus guías."}</p></div>}
      {filtered.map(item => <article className="guide-inbox__card" key={item.id}>
        <div className="guide-inbox__card-content">
          <div className="guide-inbox__person">
            <span className="guide-inbox__ref">{guideReference(item.id)}</span>
            <h3>{item.firstName} {item.lastName}</h3>
            <p><Clock3 size={14}/>{localDateTime(item.createdAt)}</p>
          </div>
          <div className="guide-inbox__summary">
            <span>{guideLabels.payment[item.payment]} · {guideLabels.property[item.property]}</span>
            <small>{guideLabels.income[item.income]}</small>
          </div>
          <div className="guide-inbox__controls">
            <label className="guide-inbox__status-label">Estado
              <select aria-label={`Estado de ${item.firstName} ${item.lastName}`}
                value={item.status}
                disabled={busy === item.id}
                onChange={e => void changeStatus(item, e.target.value as GuideRequestStatus)}>
                {requestStatuses.map(option => <option key={option.value} value={option.value}>{option.title}</option>)}
              </select>
            </label>
            <button type="button" className="guide-inbox__view" onClick={() => setSelected(current => current === item.id ? null : item.id)}>
              {selected === item.id ? <X size={17}/> : <Eye size={17}/>} {selected === item.id ? "Cerrar" : "Ver respuestas"}
            </button>
          </div>
        </div>
        {selected === item.id && <div className="guide-inbox__detail">
          <div><span>Forma de pago</span><strong>{guideLabels.payment[item.payment]}</strong></div>
          <div><span>Propiedad</span><strong>{guideLabels.property[item.property]}</strong></div>
          <div><span>Tipo de ingresos</span><strong>{guideLabels.income[item.income]}</strong></div>
          <div><span>Residencia</span><strong>{guideLabels.residence[item.residence]}</strong></div>
          <div><span>¿Ya encontró propiedad?</span><strong>{item.identified ? "Sí" : "Todavía no"}</strong></div>
          <div><span>Escritura</span><strong>{guideLabels.documents[item.documents]}</strong></div>
          <div><span>Precio estimado</span><strong>{item.price === null ? "No indicado" : new Intl.NumberFormat("es-NI", { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(item.price)}</strong></div>
          <div><span>Ahorro para prima</span><strong>{item.savings === null ? "No indicado" : new Intl.NumberFormat("es-NI", { style:"currency", currency:"USD", maximumFractionDigits:2 }).format(item.savings)}</strong></div>
          <div><span>Enviada</span><strong>{localDateTime(item.createdAt)}</strong></div>
          <div><span>Autorización</span><strong>{item.consent ? "Consentimiento otorgado" : "No registrado"}</strong></div>
          <div className="guide-inbox__detail-actions"><CheckCircle2 size={16}/><span>Respuestas guardadas con la consulta</span>
            <button disabled={busy === item.id} onClick={() => void remove(item)}><Trash2 size={16}/> Eliminar consulta</button>
          </div>
        </div>}
      </article>)}
    </div>
    {requests.length >= 150 && <p className="guide-inbox__footnote">Se muestran las 150 consultas más recientes. Usá un sistema de paginación para revisar el historial completo si supera ese volumen.</p>}
  </section>;
}
