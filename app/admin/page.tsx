"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  ArrowLeft, ArrowUpRight, Building2, CheckCircle2, CloudUpload, FilePenLine,
  Globe2, ImagePlus, LayoutDashboard, LogOut, Plus, Save, ShieldAlert, Trash2, X
} from "lucide-react";
import { auth, db, firebaseReady, storage } from "@/lib/firebase";
import { defaultSite, type Property, type PropertyCategory, type SiteContent, type Operation } from "@/lib/models";
import { cleanPropertyId, money, validImage } from "@/lib/format";

type Gate = "checking" | "setup" | "guest" | "pending" | "admin";
type Tab = "overview" | "properties" | "content";

const emptyProperty = (): Property => ({
  id: "", title: "", category: "Casa", operation: "Venta", city: "",
  location: "", price: 0, area: 0, bedrooms: 0, bathrooms: 0,
  images: [], description: "", highlights: [], featured: false, published: false,
  createdAt: Date.now()
});

export default function AdminPage() {
  const [gate, setGate] = useState<Gate>(firebaseReady ? "checking" : "setup");
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [site, setSite] = useState<SiteContent>(defaultSite);
  const [form, setForm] = useState<Property>(emptyProperty);
  const [editing, setEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth || !db) return;
    let unsubProperties: (() => void) | undefined;
    let unsubSite: (() => void) | undefined;
    let active = true;
    const stopAuth = onAuthStateChanged(auth, async signedIn => {
      unsubProperties?.(); unsubSite?.();
      if (!active) return;
      setUser(signedIn);
      setGate(signedIn ? "checking" : "guest");
      if (!signedIn) return;
      try {
        const adminDoc = await getDoc(doc(db!, "admins", signedIn.uid));
        if (!active) return;
        if (!adminDoc.exists()) { setGate("pending"); return; }
        setGate("admin");
        unsubProperties = onSnapshot(collection(db!, "properties"), snapshot => {
          setProperties(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as Property))
            .sort((a, b) => b.createdAt - a.createdAt));
        }, () => setError("No se pudieron sincronizar las propiedades."));
        unsubSite = onSnapshot(doc(db!, "site", "public"), snapshot => {
          setSite({ ...defaultSite, ...(snapshot.exists() ? snapshot.data() : {}) });
        }, () => setError("No se pudo sincronizar el contenido."));
      } catch {
        if (active) { setGate("pending"); setError("No fue posible verificar el permiso de administrador."); }
      }
    });
    return () => { active = false; stopAuth(); unsubProperties?.(); unsubSite?.(); };
  }, []);

  const stats = useMemo(() => ({
    total: properties.length,
    published: properties.filter(p => p.published).length,
    featured: properties.filter(p => p.featured).length
  }), [properties]);

  const flash = (message: string) => { setNotice(message); setError(""); };
  const change = <K extends keyof Property>(key: K, value: Property[K]) =>
    setForm(previous => ({ ...previous, [key]: value }));
  const siteChange = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setSite(previous => ({ ...previous, [key]: value }));

  async function login() {
    if (!auth) return;
    setError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch { setError("No fue posible iniciar sesión. Verifica que Google esté habilitado y el dominio autorizado en Firebase."); }
  }

  function startNew() {
    setForm(emptyProperty()); setFiles([]); setEditing(true); setTab("properties"); setError(""); setNotice("");
  }

  function startEdit(property: Property) {
    setForm({ ...property, images: [...(property.images || [])], highlights: [...(property.highlights || [])] });
    setFiles([]); setEditing(true); setTab("properties"); setError(""); setNotice("");
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !storage || saving) return;
    if (!form.title.trim() || !form.city.trim() || !form.location.trim() || form.area <= 0) {
      setError("Completa título, ciudad, ubicación y superficie mayor que cero."); return;
    }
    if (files.some(f => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size >= 8 * 1024 * 1024)) {
      setError("Las imágenes deben ser JPEG, PNG o WebP y pesar menos de 8 MB."); return;
    }
    setSaving(true); setError(""); setNotice("");
    const id = form.id || `${cleanPropertyId(form.title) || "inmueble"}-${crypto.randomUUID().slice(0, 8)}`;
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileRef = ref(storage, `property-images/${id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`);
        await uploadBytes(fileRef, file, { contentType: file.type });
        uploaded.push(await getDownloadURL(fileRef));
      }
      const payload: Property = {
        ...form, id, title: form.title.trim(), city: form.city.trim(), location: form.location.trim(),
        images: [...form.images.filter(validImage), ...uploaded],
        highlights: form.highlights.filter(Boolean),
        price: Math.max(0, Number(form.price) || 0), area: Math.max(0, Number(form.area) || 0),
        bedrooms: Math.max(0, Number(form.bedrooms) || 0), bathrooms: Math.max(0, Number(form.bathrooms) || 0),
        landArea: Math.max(0, Number(form.landArea) || 0),
        createdAt: form.createdAt || Date.now(), demo: false
      };
      await setDoc(doc(db, "properties", id), payload);
      setFiles([]); setForm(emptyProperty()); setEditing(false);
      flash("Propiedad guardada correctamente en Firestore.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar la propiedad."); }
    finally { setSaving(false); }
  }

  async function removeProperty(property: Property) {
    if (!db || !window.confirm(`¿Eliminar definitivamente "${property.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, "properties", property.id));
      flash("Propiedad eliminada del catálogo. Revisa Storage para retirar imágenes antiguas que ya no se usen.");
    } catch { setError("No fue posible eliminar la propiedad."); }
  }

  async function toggleProperty(property: Property) {
    if (!db) return;
    try { await updateDoc(doc(db, "properties", property.id), { published: !property.published }); flash(property.published ? "Propiedad despublicada." : "Propiedad publicada."); }
    catch { setError("No se pudo cambiar la publicación."); }
  }

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || saving) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await setDoc(doc(db, "site", "public"), {
        ...site,
        heroImage: validImage(site.heroImage) ? site.heroImage : defaultSite.heroImage,
        aboutImage: validImage(site.aboutImage) ? site.aboutImage : defaultSite.aboutImage
      });
      flash("Contenido del sitio actualizado. Los cambios ya se reflejan en la web.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar los cambios."); }
    finally { setSaving(false); }
  }

  if (gate !== "admin") return <main className="admin-access">
    <div className="admin-access__brand"><img src="/logo-isabel.svg" width={270} height={68} alt="Isabel Valenzuela" /></div>
    <div className="admin-access__card">
      {gate === "checking" ? <><p className="eyebrow eyebrow--gold">VERIFICANDO ACCESO</p><h1>Un momento.</h1><p>Validando tu cuenta con Firebase.</p></> :
      gate === "setup" ? <><ShieldAlert size={38} /><p className="eyebrow eyebrow--gold">CONFIGURACIÓN PENDIENTE</p><h1>Conecta Firebase para activar la administración.</h1><p>La web pública funciona en modo demostración. Añade las variables de Firebase, habilita Google Authentication y despliega las reglas de seguridad.</p><code>NEXT_PUBLIC_FIREBASE_*</code></> :
      gate === "guest" ? <><p className="eyebrow eyebrow--gold">ACCESO PRIVADO</p><h1>Tu espacio de gestión.</h1><p>Inicia sesión con la cuenta Google autorizada para administrar propiedades, imágenes y contenido.</p><button className="btn btn--gold" onClick={login}>Entrar con Google <ArrowUpRight size={18}/></button></> :
      <><ShieldAlert size={34}/><p className="eyebrow eyebrow--gold">PERMISO REQUERIDO</p><h1>Tu cuenta todavía no está autorizada.</h1><p>Para habilitar el acceso, crea manualmente este documento en Firestore desde Firebase Console:</p><code>admins/{user?.uid}</code><p>Después, actualiza la página. Solo el propietario del proyecto Firebase puede conceder este permiso.</p><button className="btn btn--outline-dark" onClick={() => auth && signOut(auth)}>Cambiar de cuenta</button></>}
      {error && <p className="admin-message admin-message--error" role="alert">{error}</p>}
      <Link href="/" className="admin-access__back"><ArrowLeft size={17} /> Volver al sitio público</Link>
    </div>
    <p className="admin-access__credit">POWERED BY XARCON</p>
  </main>;

  return <main className="admin">
    <aside className="admin__sidebar">
      <Link href="/" className="admin__logo"><img src="/logo-isabel.svg" width={230} height={59} alt="Isabel Valenzuela" /></Link>
      <p className="admin__nav-label">ESPACIO DE TRABAJO</p>
      <button className={tab === "overview" ? "selected" : ""} onClick={() => {setTab("overview"); setEditing(false);}}><LayoutDashboard size={18}/> Resumen</button>
      <button className={tab === "properties" ? "selected" : ""} onClick={() => {setTab("properties"); setEditing(false);}}><Building2 size={18}/> Propiedades</button>
      <button className={tab === "content" ? "selected" : ""} onClick={() => {setTab("content"); setEditing(false);}}><FilePenLine size={18}/> Contenido web</button>
      <div className="admin__sidebar-bottom"><Link href="/" target="_blank"><Globe2 size={18}/> Ver sitio público <ArrowUpRight size={15}/></Link><button onClick={() => auth && signOut(auth)}><LogOut size={18}/> Cerrar sesión</button></div>
    </aside>
    <div className="admin__workspace">
      <header className="admin__top"><div><span className="admin__mobile-label">ISABEL VALENZUELA · PANEL</span><p>GESTIÓN INMOBILIARIA</p><h1>{tab === "overview" ? "Panel general" : tab === "properties" ? "Propiedades" : "Contenido del sitio"}</h1></div><div className="admin__user"><span>{user?.displayName || user?.email}</span>{user?.photoURL ? <img src={user.photoURL} width={36} height={36} alt="" /> : <span className="admin__avatar">IV</span>}</div></header>
      <nav className="admin__mobile-nav" aria-label="Opciones del panel"><button onClick={() => {setTab("overview"); setEditing(false);}}>Resumen</button><button onClick={() => {setTab("properties"); setEditing(false);}}>Propiedades</button><button onClick={() => {setTab("content"); setEditing(false);}}>Contenido</button><button onClick={() => auth && signOut(auth)}>Salir</button></nav>
      {error && <div className="admin-message admin-message--error" role="alert">{error} <button onClick={() => setError("")}><X size={15}/></button></div>}
      {notice && <div className="admin-message admin-message--success" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}

      {tab === "overview" && <div className="admin__content">
        <div className="admin__welcome"><div><p className="eyebrow eyebrow--gold">TU PORTAFOLIO, EN UN SOLO LUGAR</p><h2>Bienvenida al espacio de Isabel.</h2><p>Publica propiedades y mantén tu presencia digital siempre actualizada.</p></div><button className="btn btn--gold" onClick={startNew}>Nueva propiedad <Plus size={18}/></button></div>
        <div className="admin-stats"><div><span>PROPIEDADES TOTALES</span><strong>{stats.total}</strong><Building2 size={23}/></div><div><span>PUBLICADAS</span><strong>{stats.published}</strong><CheckCircle2 size={23}/></div><div><span>DESTACADAS</span><strong>{stats.featured}</strong><ImagePlus size={23}/></div></div>
        <div className="admin-panel"><div className="admin-panel__title"><h3>Publicaciones recientes</h3><button className="text-link" onClick={() => setTab("properties")}>Administrar todo <ArrowUpRight size={17}/></button></div>{properties.length ? <div className="admin-list">{properties.slice(0, 5).map(property => <div className="admin-list__row" key={property.id}><img src={property.images?.[0] || "/property-fallback.svg"} width={76} height={57} alt="" /><div><strong>{property.title}</strong><small>{property.location}</small></div><span className={property.published ? "admin-tag admin-tag--on" : "admin-tag"}>{property.published ? "Publicada" : "Borrador"}</span><button onClick={() => startEdit(property)} aria-label="Editar propiedad"><FilePenLine size={18}/></button></div>)}</div> : <p className="admin-empty">No hay propiedades en Firestore todavía. Crea la primera publicación.</p>}</div>
      </div>}

      {tab === "properties" && <div className="admin__content">
        {!editing ? <>
          <div className="admin__section-header"><div><p>Gestiona tus anuncios, imágenes, precios y su visibilidad pública.</p><h2>Inventario inmobiliario</h2></div><button className="btn btn--dark" onClick={startNew}>Agregar propiedad <Plus size={18}/></button></div>
          <div className="admin-panel">{properties.length ? <div className="admin-list">{properties.map(property => <div className="admin-list__row" key={property.id}><img src={property.images?.[0] || "/property-fallback.svg"} alt="" width={76} height={57} /><div><strong>{property.title}</strong><small>{property.city} · {money(property.price)}</small></div><span className={property.published ? "admin-tag admin-tag--on" : "admin-tag"}>{property.published ? "Publicada" : "Borrador"}</span><div className="admin-list__actions"><button onClick={() => toggleProperty(property)} title={property.published ? "Pasar a borrador" : "Publicar"}><Globe2 size={17}/></button><button onClick={() => startEdit(property)} title="Editar"><FilePenLine size={17}/></button><button className="admin-danger" onClick={() => removeProperty(property)} title="Eliminar"><Trash2 size={17}/></button></div></div>)}</div> : <div className="admin-empty"><Building2 size={30}/><h3>Tu catálogo empieza aquí.</h3><p>Crea una propiedad y comienza a construir tu portafolio.</p><button className="btn btn--dark" onClick={startNew}>Agregar primera propiedad <Plus size={17}/></button></div>}</div>
        </> : <>
          <div className="admin__section-header"><div><button className="admin-back" onClick={() => {setEditing(false); setFiles([]);}}><ArrowLeft size={17}/> Volver al inventario</button><h2>{form.id ? "Editar propiedad" : "Nueva propiedad"}</h2><p>Todos los cambios se almacenarán en tu proyecto Firebase.</p></div></div>
          <form onSubmit={saveProperty} className="admin-form">
            <div className="admin-panel"><h3>Información principal</h3><div className="form-grid">
              <label className="span-2">Nombre de la propiedad <input required value={form.title} onChange={e => change("title", e.target.value)} placeholder="Ej. Residencia contemporánea en Matagalpa"/></label>
              <label>Tipo de propiedad <select value={form.category} onChange={e => change("category", e.target.value as PropertyCategory)}>{["Casa","Apartamento","Terreno","Finca","Comercial"].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>Operación <select value={form.operation} onChange={e => change("operation", e.target.value as Operation)}><option>Venta</option><option>Alquiler</option></select></label>
              <label>Ciudad <input required value={form.city} onChange={e => change("city", e.target.value)} placeholder="Matagalpa"/></label>
              <label>Ubicación / sector <input required value={form.location} onChange={e => change("location", e.target.value)} placeholder="Sector, ciudad, departamento"/></label>
              <label>Precio (USD) <input type="number" min={0} step="any" value={form.price} onChange={e => change("price", Number(e.target.value))}/></label>
              <label>Superficie (m²) <input required type="number" min={1} step="any" value={form.area || ""} onChange={e => change("area", Number(e.target.value))}/></label>
              <label>Terreno (m², opcional) <input type="number" min={0} step="any" value={form.landArea || ""} onChange={e => change("landArea", Number(e.target.value))}/></label>
              <label>Habitaciones <input type="number" min={0} value={form.bedrooms} onChange={e => change("bedrooms", Number(e.target.value))}/></label>
              <label>Baños <input type="number" min={0} value={form.bathrooms} onChange={e => change("bathrooms", Number(e.target.value))}/></label>
              <label className="span-2">Descripción <textarea required rows={5} value={form.description} onChange={e => change("description", e.target.value)} placeholder="Describe las características reales de esta propiedad..."/></label>
              <label className="span-2">Atributos destacados (separados por comas) <input value={form.highlights.join(", ")} onChange={e => change("highlights", e.target.value.split(",").map(s => s.trim()))} placeholder="Terraza, Jardín, Estacionamiento"/></label>
            </div></div>
            <div className="admin-panel"><h3>Galería fotográfica</h3><p className="admin-hint">Sube varias imágenes JPEG, PNG o WebP a Firebase Storage. Máximo 8 MB por foto.</p><label className="upload-zone"><CloudUpload size={30}/><strong>Seleccionar imágenes</strong><span>{files.length ? `${files.length} archivo(s) seleccionado(s)` : "Arrastra o selecciona imágenes desde tu equipo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => setFiles(Array.from(e.target.files || []))}/></label>
              {form.images.length > 0 && <div className="image-editor">{form.images.map((url, i) => <div key={url + i}><img src={url} alt={`Imagen ${i+1}`}/><button type="button" title="Quitar de esta publicación" onClick={() => change("images", form.images.filter((_, n) => n !== i))}><X size={16}/></button></div>)}</div>}
              <label className="admin-url-label">También puedes añadir URLs HTTPS de imágenes (una por línea)<textarea rows={3} value={form.images.join("\n")} onChange={e => change("images", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} placeholder="https://..."/></label>
            </div>
            <div className="admin-panel"><h3>Publicación</h3><div className="form-checks"><label><input type="checkbox" checked={form.published} onChange={e => change("published", e.target.checked)}/> Publicar en la web</label><label><input type="checkbox" checked={form.featured} onChange={e => change("featured", e.target.checked)}/> Marcar como destacada</label></div></div>
            <div className="admin-form__actions"><button type="button" className="btn btn--outline-dark" onClick={() => {setEditing(false); setFiles([]);}}>Cancelar</button><button disabled={saving} type="submit" className="btn btn--dark">{saving ? "Guardando imágenes y datos..." : "Guardar propiedad"} <Save size={17}/></button></div>
          </form>
        </>}
      </div>}

      {tab === "content" && <div className="admin__content">
        <div className="admin__section-header"><div><p>Actualiza los textos, fotografías y datos de contacto sin tocar código.</p><h2>Tu página, tu identidad</h2></div></div>
        <form className="admin-form" onSubmit={saveSite}>
          <div className="admin-panel"><h3>Portada / Hero</h3><div className="form-grid">
            <label className="span-2">Etiqueta superior <input value={site.eyebrow} onChange={e => siteChange("eyebrow", e.target.value)}/></label>
            <label className="span-2">Titular principal <textarea rows={2} value={site.heroTitle} onChange={e => siteChange("heroTitle", e.target.value)}/></label>
            <label className="span-2">Texto de apoyo <textarea rows={3} value={site.heroSubtitle} onChange={e => siteChange("heroSubtitle", e.target.value)}/></label>
            <label className="span-2">URL HTTPS de la fotografía de portada <input value={site.heroImage} onChange={e => siteChange("heroImage", e.target.value)}/></label>
          </div></div>
          <div className="admin-panel"><h3>Presentación del sitio</h3><div className="form-grid"><label className="span-2">Título de introducción <input value={site.introTitle} onChange={e => siteChange("introTitle", e.target.value)}/></label><label className="span-2">Descripción de introducción <textarea rows={3} value={site.introDescription} onChange={e => siteChange("introDescription", e.target.value)}/></label></div></div>
          <div className="admin-panel"><h3>Sobre Isabel</h3><div className="form-grid"><label className="span-2">Titular <input value={site.aboutTitle} onChange={e => siteChange("aboutTitle", e.target.value)}/></label><label className="span-2">Biografía / presentación <textarea rows={5} value={site.aboutDescription} onChange={e => siteChange("aboutDescription", e.target.value)}/></label><label className="span-2">URL HTTPS de imagen de sección <input value={site.aboutImage} onChange={e => siteChange("aboutImage", e.target.value)}/></label></div></div>
          <div className="admin-panel"><h3>Contacto y cobertura</h3><p className="admin-hint">Los botones de contacto aparecen automáticamente cuando configuras WhatsApp o correo reales.</p><div className="form-grid">
            <label>WhatsApp (código de país, sin signos) <input value={site.whatsapp} onChange={e => siteChange("whatsapp", e.target.value)} placeholder="505XXXXXXXX"/></label>
            <label>Correo de consultas <input type="email" value={site.email} onChange={e => siteChange("email", e.target.value)} placeholder="correo@dominio.com"/></label>
            <label>Instagram (URL HTTPS) <input value={site.instagram} onChange={e => siteChange("instagram", e.target.value)} placeholder="https://instagram.com/..."/></label>
            <label>Área de atención <input value={site.serviceArea} onChange={e => siteChange("serviceArea", e.target.value)}/></label>
          </div></div>
          <div className="admin-form__actions"><button type="submit" disabled={saving} className="btn btn--dark">{saving ? "Guardando..." : "Publicar cambios"} <Save size={18}/></button></div>
        </form>
      </div>}
    </div>
  </main>;
}
