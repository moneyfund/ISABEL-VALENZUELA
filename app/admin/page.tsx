"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { getIdTokenResult, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  ArrowLeft, ArrowUpRight, Bell, Building2, CheckCircle2, ClipboardList, CloudUpload, FilePenLine,
  Globe2, ImagePlus, LayoutDashboard, LogOut, Plus, Save, ShieldAlert, Trash2, X
} from "lucide-react";
import { auth, db, firebaseReady, storage } from "@/lib/firebase";
import { defaultSite, normalizeSiteContent, validPropertyCoordinates, type Property, type PropertyCategory, type SiteContent, type Operation } from "@/lib/models";
import { cleanPropertyId, money, validImage } from "@/lib/format";
import { contactEmail, safeSocialUrl, whatsappUrl } from "@/lib/social";
import SocialLinks from "@/components/SocialLinks";
import { isAllowedAdminEmail } from "@/lib/admin-access";
import GuideRequestsPanel from "@/components/admin/GuideRequestsPanel";
import CategoryFields from "@/components/admin/CategoryFields";
import PropertyMapEditor from "@/components/admin/PropertyMapEditor";
import { cleanedPropertyDetails, hasAreaUnitSelector, hasBedrooms, hasBathrooms, hasLandArea, propertyCategoryInfo } from "@/lib/property-details";
import "./property-form.css";
import "./admin-requests.css";

type Gate = "checking" | "setup" | "guest" | "denied" | "admin";
type Tab = "overview" | "properties" | "content" | "requests";

const emptyProperty = (): Property => ({
  id: "", title: "", category: "Casa", operation: "Venta", city: "",
  location: "", coordinates: null, price: 0, area: 0, areaUnit: "m2", bedrooms: 0, bathrooms: 0, details: {},
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
  const [newGuidesCount, setNewGuidesCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth || !db) return;
    let unsubProperties: (() => void) | undefined;
    let unsubSite: (() => void) | undefined;
    let unsubGuides: (() => void) | undefined;
    let active = true;
    const stopAuth = onAuthStateChanged(auth, async signedIn => {
      unsubProperties?.(); unsubSite?.(); unsubGuides?.();
      unsubProperties = undefined; unsubSite = undefined; unsubGuides = undefined;
      if (!active) return;
      setNewGuidesCount(null);
      setUser(signedIn);
      setGate(signedIn ? "checking" : "guest");
      if (!signedIn) return;
      try {
        const token = await getIdTokenResult(signedIn);
        if (!active) return;
        // The email is only an initial UI check; backend rules repeat the
        // same whitelist with a verified Google sign-in token.
        const authorized = signedIn.emailVerified
          && isAllowedAdminEmail(signedIn.email)
          && token.signInProvider === "google.com";
        if (!authorized) {
          setGate("denied");
          return;
        }
        setGate("admin");
        // Independent listener: the nav counter updates on submissions, status changes,
        // or deletions without needing to open the Guías recibidas section.
        unsubGuides = onSnapshot(
          query(collection(db!, "purchase_requests"), where("status", "==", "nuevo")),
          snapshot => setNewGuidesCount(snapshot.size),
          () => {
            setNewGuidesCount(null);
            setError("No fue posible cargar el contador de guías nuevas. Verificá las reglas de Firestore.");
          }
        );
        unsubProperties = onSnapshot(collection(db!, "properties"), snapshot => {
          setProperties(snapshot.docs
            .filter(entry => !entry.id.startsWith("demo-") && entry.data().demo !== true)
            .map(entry => ({ ...entry.data(), id: entry.id } as Property))
            .sort((a, b) => b.createdAt - a.createdAt));
        }, () => setError("No se pudieron sincronizar las propiedades. Comprueba las reglas de Firestore."));
        unsubSite = onSnapshot(doc(db!, "site", "public"), snapshot => {
          setSite(normalizeSiteContent(snapshot.exists() ? snapshot.data() : null));
        }, () => setError("No se pudo sincronizar el contenido. Comprueba las reglas de Firestore."));
      } catch {
        if (active) { setGate("denied"); setError("No fue posible verificar los permisos de esta cuenta."); }
      }
    });
    return () => { active = false; stopAuth(); unsubProperties?.(); unsubSite?.(); unsubGuides?.(); };
  }, []);


  const stats = useMemo(() => ({
    total: properties.length,
    published: properties.filter(p => p.published).length,
    featured: properties.filter(p => p.featured).length
  }), [properties]);

  const flash = (message: string) => { setNotice(message); setError(""); };
  const change = <K extends keyof Property>(key: K, value: Property[K]) =>
    setForm(previous => ({ ...previous, [key]: value }));
  function changeCategory(category: PropertyCategory) {
    setForm(previous => previous.category === category ? previous : ({
      ...previous,
      category,
      area: 0,
      areaUnit: category === "Finca" ? "mz" : "m2",
      bedrooms: 0,
      bathrooms: 0,
      landArea: undefined,
      details: {}
    }));
    setError("");
  }

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
        coordinates: validPropertyCoordinates(form.coordinates) ? {
          lat: Number(form.coordinates.lat.toFixed(6)),
          lng: Number(form.coordinates.lng.toFixed(6))
        } : null,
        highlights: form.highlights.filter(Boolean),
        price: Math.max(0, Number(form.price) || 0), area: Math.max(0, Number(form.area) || 0),
        bedrooms: hasBedrooms(form.category) ? Math.max(0, Number(form.bedrooms) || 0) : 0,
        bathrooms: hasBathrooms(form.category) ? Math.max(0, Number(form.bathrooms) || 0) : 0,
        landArea: hasLandArea(form.category) ? Math.max(0, Number(form.landArea) || 0) : 0,
        areaUnit: hasAreaUnitSelector(form.category) && form.areaUnit === "mz" ? "mz" : "m2",
        details: cleanedPropertyDetails(form.category, form.details),
        createdAt: form.createdAt || Date.now()
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

  async function uploadSiteImage(field: "heroImage" | "heroImage2" | "heroImage3" | "aboutImage", file?: File) {
    if (!file || !storage || saving) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size >= 8 * 1024 * 1024) {
      setError("Selecciona una foto JPEG, PNG o WebP menor de 8 MB."); return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const imageRef = ref(storage, `site-images/${field}-${Date.now()}-${safeName}`);
      await uploadBytes(imageRef, file, { contentType: file.type });
      siteChange(field, await getDownloadURL(imageRef));
      flash("Imagen subida a Storage. Pulsa «Publicar cambios» para mostrarla en la web.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo subir la imagen."); }
    finally { setSaving(false); }
  }

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || saving) return;
    const invalidLinks = [
      { name: "Facebook", value: site.facebook, ok: safeSocialUrl("facebook", site.facebook) },
      { name: "Instagram", value: site.instagram, ok: safeSocialUrl("instagram", site.instagram) },
      { name: "TikTok", value: site.tiktok, ok: safeSocialUrl("tiktok", site.tiktok) }
    ].filter(item => item.value?.trim() && !item.ok);
    if (invalidLinks.length) {
      setError(`El enlace de ${invalidLinks[0].name} debe ser una dirección HTTPS válida de esa red social.`);
      return;
    }
    if (site.whatsapp.trim() && !whatsappUrl(site.whatsapp)) {
      setError("Introduce un número de WhatsApp válido con código de país (8 a 15 dígitos).");
      return;
    }
    if (site.email.trim() && !contactEmail(site.email)) {
      setError("Introduce un correo electrónico válido."); return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      await setDoc(doc(db, "site", "public"), {
        ...site,
        heroImage: validImage(site.heroImage) ? site.heroImage : defaultSite.heroImage,
        heroImage2: validImage(site.heroImage2) ? site.heroImage2 : defaultSite.heroImage2,
        heroImage3: validImage(site.heroImage3) ? site.heroImage3 : defaultSite.heroImage3,
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
      gate === "setup" ? <><ShieldAlert size={38} /><p className="eyebrow eyebrow--gold">CONFIGURACIÓN PENDIENTE</p><h1>Conecta Firebase para activar la administración.</h1><p>Añade las variables de Firebase, habilita Google Authentication y despliega las reglas de seguridad para activar el catálogo.</p><code>NEXT_PUBLIC_FIREBASE_*</code></> :
      gate === "guest" ? <><p className="eyebrow eyebrow--gold">ACCESO PRIVADO</p><h1>Tu espacio de gestión.</h1><p>Inicia sesión con la cuenta Google autorizada para administrar propiedades, imágenes y contenido.</p><button className="btn btn--gold" onClick={login}>Entrar con Google <ArrowUpRight size={18}/></button></> :
      <><ShieldAlert size={34}/><p className="eyebrow eyebrow--gold">ACCESO RESTRINGIDO</p><h1>Esta cuenta no tiene permisos de administración.</h1><p>El panel está reservado a las dos cuentas autorizadas de Google para Isabel Valenzuela. Inicia sesión con una de ellas.</p><button className="btn btn--outline-dark" onClick={() => auth && signOut(auth)}>Cambiar de cuenta</button></>}
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
      <button className={tab === "requests" ? "selected" : ""} onClick={() => {setTab("requests"); setEditing(false);}}
        aria-label={newGuidesCount ? `Guías recibidas, ${newGuidesCount} solicitudes nuevas` : "Guías recibidas"}>
        <ClipboardList size={18}/> Guías recibidas
        {newGuidesCount !== null && newGuidesCount > 0 &&
          <span className="admin-guides-badge" aria-label={`${newGuidesCount} nuevas`}>
            <Bell size={12} aria-hidden="true"/>{newGuidesCount}
          </span>}
      </button>
      <div className="admin__sidebar-bottom"><Link href="/" target="_blank"><Globe2 size={18}/> Ver sitio público <ArrowUpRight size={15}/></Link><button onClick={() => auth && signOut(auth)}><LogOut size={18}/> Cerrar sesión</button></div>
    </aside>
    <div className="admin__workspace">
      <header className="admin__top"><div><span className="admin__mobile-label">ISABEL VALENZUELA · PANEL</span><p>GESTIÓN INMOBILIARIA</p><h1>{tab === "overview" ? "Panel general" : tab === "properties" ? "Propiedades" : tab === "requests" ? "Guías recibidas" : "Contenido del sitio"}</h1></div><div className="admin__user"><span>{user?.displayName || user?.email}</span>{user?.photoURL ? <img src={user.photoURL} width={36} height={36} alt="" /> : <span className="admin__avatar">IV</span>}</div></header>
      <nav className="admin__mobile-nav" aria-label="Opciones del panel"><button onClick={() => {setTab("overview"); setEditing(false);}}>Resumen</button><button onClick={() => {setTab("properties"); setEditing(false);}}>Propiedades</button><button onClick={() => {setTab("content"); setEditing(false);}}>Contenido</button><button onClick={() => {setTab("requests"); setEditing(false);}}
          aria-label={newGuidesCount ? `Guías recibidas, ${newGuidesCount} solicitudes nuevas` : "Guías recibidas"}>
          Guías
          {newGuidesCount !== null && newGuidesCount > 0 && <span className="admin-guides-badge admin-guides-badge--mobile" aria-label={`${newGuidesCount} nuevas`}><Bell size={12} aria-hidden="true"/>{newGuidesCount}</span>}
        </button><button onClick={() => auth && signOut(auth)}>Salir</button></nav>
      {error && <div className="admin-message admin-message--error" role="alert">{error} <button onClick={() => setError("")}><X size={15}/></button></div>}
      {notice && <div className="admin-message admin-message--success" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}

      {tab === "overview" && <div className="admin__content">
        <div className="admin__welcome"><div><p className="eyebrow eyebrow--gold">TU PORTAFOLIO, EN UN SOLO LUGAR</p><h2>Bienvenida al espacio de Isabel.</h2><p>Publica propiedades y mantén tu presencia digital siempre actualizada.</p></div><button className="btn btn--gold" onClick={startNew}>Nueva propiedad <Plus size={18}/></button></div>
        <div className="admin-stats"><div><span>PROPIEDADES TOTALES</span><strong>{stats.total}</strong><Building2 size={23}/></div><div><span>PUBLICADAS</span><strong>{stats.published}</strong><CheckCircle2 size={23}/></div><div><span>DESTACADAS</span><strong>{stats.featured}</strong><ImagePlus size={23}/></div></div>
        <div className="admin-panel"><div className="admin-panel__title"><h3>Publicaciones recientes</h3><button className="text-link" onClick={() => setTab("properties")}>Administrar todo <ArrowUpRight size={17}/></button></div>{properties.length ? <div className="admin-list">{properties.slice(0, 5).map(property => <div className="admin-list__row" key={property.id}><img src={property.images?.[0] || "/property-fallback.svg"} width={76} height={57} alt="" /><div><strong>{property.title}</strong><small>{property.location}</small></div><span className={property.published ? "admin-tag admin-tag--on" : "admin-tag"}>{property.published ? "Publicada" : "Borrador"}</span><button onClick={() => startEdit(property)} aria-label="Editar propiedad"><FilePenLine size={18}/></button></div>)}</div> : <p className="admin-empty">No hay propiedades en Firestore todavía. Crea la primera publicación.</p>}</div>
      </div>}

      {tab === "requests" && <GuideRequestsPanel />}

      {tab === "properties" && <div className="admin__content">
        {!editing ? <>
          <div className="admin__section-header"><div><p>Gestiona tus anuncios, imágenes, precios y su visibilidad pública.</p><h2>Inventario inmobiliario</h2></div><button className="btn btn--dark" onClick={startNew}>Agregar propiedad <Plus size={18}/></button></div>
          <div className="admin-panel">{properties.length ? <div className="admin-list">{properties.map(property => <div className="admin-list__row" key={property.id}><img src={property.images?.[0] || "/property-fallback.svg"} alt="" width={76} height={57} /><div><strong>{property.title}</strong><small>{property.city} · {money(property.price)}</small></div><span className={property.published ? "admin-tag admin-tag--on" : "admin-tag"}>{property.published ? "Publicada" : "Borrador"}</span><div className="admin-list__actions"><button onClick={() => toggleProperty(property)} title={property.published ? "Pasar a borrador" : "Publicar"}><Globe2 size={17}/></button><button onClick={() => startEdit(property)} title="Editar"><FilePenLine size={17}/></button><button className="admin-danger" onClick={() => removeProperty(property)} title="Eliminar"><Trash2 size={17}/></button></div></div>)}</div> : <div className="admin-empty"><Building2 size={30}/><h3>Tu catálogo empieza aquí.</h3><p>Crea una propiedad y comienza a construir tu portafolio.</p><button className="btn btn--dark" onClick={startNew}>Agregar primera propiedad <Plus size={17}/></button></div>}</div>
        </> : <>
          <div className="admin__section-header"><div><button className="admin-back" onClick={() => {setEditing(false); setFiles([]);}}><ArrowLeft size={17}/> Volver al inventario</button><h2>{form.id ? "Editar propiedad" : "Nueva propiedad"}</h2><p>Todos los cambios se almacenarán en tu proyecto Firebase.</p></div></div>
          <form onSubmit={saveProperty} className="admin-form">
            <div className="admin-panel"><h3>Información principal</h3><div className="form-grid">
              <label className="span-2">Nombre de la propiedad <input required value={form.title} onChange={e => change("title", e.target.value)} placeholder="Ej. Residencia contemporánea en Matagalpa"/></label>
              <label>Tipo de propiedad <select value={form.category} onChange={e => changeCategory(e.target.value as PropertyCategory)}>{["Casa","Apartamento","Terreno","Finca","Comercial"].map(x => <option key={x}>{x}</option>)}</select></label>
              <label>Operación <select value={form.operation} onChange={e => change("operation", e.target.value as Operation)}><option>Venta</option><option>Alquiler</option></select></label>
              <label>Ciudad <input required value={form.city} onChange={e => change("city", e.target.value)} placeholder="Matagalpa"/></label>
              <label>Ubicación / sector <input required value={form.location} onChange={e => change("location", e.target.value)} placeholder="Sector, ciudad, departamento"/></label>
              <label>Precio (USD) <input type="number" min={0} step="any" value={form.price} onChange={e => change("price", Number(e.target.value))}/></label>
              <label>{propertyCategoryInfo[form.category].areaLabel} ({form.areaUnit === "mz" ? "manzanas" : "m²"}) <input required type="number" min={0.01} step="any" value={form.area || ""} placeholder={form.areaUnit === "mz" ? "Ej. 12.5" : "Ej. 250"} onChange={e => change("area", Number(e.target.value))}/></label>
              {hasAreaUnitSelector(form.category) && <label>Unidad de superficie <select value={form.areaUnit === "mz" ? "mz" : "m2"} onChange={e => change("areaUnit", e.target.value as "m2" | "mz")}><option value="m2">Metros cuadrados (m²)</option><option value="mz">Manzanas (mz)</option></select></label>}
              <label className="span-2">Descripción <textarea required rows={5} value={form.description} onChange={e => change("description", e.target.value)} placeholder="Describe las características reales de esta propiedad..."/></label>
              <label className="span-2">Atributos destacados (separados por comas) <input value={form.highlights.join(", ")} onChange={e => change("highlights", e.target.value.split(",").map(s => s.trim()))} placeholder="Terraza, Jardín, Estacionamiento"/></label>
            </div>
              <p className="admin-category-panel__note">Al cambiar el tipo de propiedad se reinician únicamente las medidas y características específicas. El título, la ubicación, el precio, la descripción y las fotografías se conservan.</p>
            </div>
            <CategoryFields property={form} onUpdate={patch => setForm(previous => ({ ...previous, ...patch }))} />
            <PropertyMapEditor coordinates={form.coordinates} onChange={coordinates => change("coordinates", coordinates)}/>
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
            <label className="span-2">O subir imagen de portada desde tu equipo <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void uploadSiteImage("heroImage", e.target.files?.[0])}/></label>
            <label className="span-2">Segunda fotografía del hero (URL HTTPS) <input value={site.heroImage2} onChange={e => siteChange("heroImage2", e.target.value)}/></label>
            <label className="span-2">O subir segunda fotografía <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void uploadSiteImage("heroImage2", e.target.files?.[0])}/></label>
            <label className="span-2">Tercera fotografía del hero (URL HTTPS) <input value={site.heroImage3} onChange={e => siteChange("heroImage3", e.target.value)}/></label>
            <label className="span-2">O subir tercera fotografía <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void uploadSiteImage("heroImage3", e.target.files?.[0])}/></label>
          </div></div>
          <div className="admin-panel"><h3>Presentación del sitio</h3><div className="form-grid"><label className="span-2">Título de introducción <input value={site.introTitle} onChange={e => siteChange("introTitle", e.target.value)}/></label><label className="span-2">Descripción de introducción <textarea rows={3} value={site.introDescription} onChange={e => siteChange("introDescription", e.target.value)}/></label></div></div>
          <div className="admin-panel"><h3>Sobre Isabel</h3><div className="form-grid"><label className="span-2">Titular <input value={site.aboutTitle} onChange={e => siteChange("aboutTitle", e.target.value)}/></label><label className="span-2">Biografía / presentación <textarea rows={5} value={site.aboutDescription} onChange={e => siteChange("aboutDescription", e.target.value)}/></label><label className="span-2">URL HTTPS de imagen de sección <input value={site.aboutImage} onChange={e => siteChange("aboutImage", e.target.value)}/></label><label className="span-2">O subir imagen para esta sección <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void uploadSiteImage("aboutImage", e.target.files?.[0])}/></label></div></div>
          <div className="admin-panel"><h3>Contacto y cobertura</h3><p className="admin-hint">El correo y la zona de servicio se mostrarán en las páginas públicas.</p><div className="form-grid">
            <label>Correo de consultas <input type="email" value={site.email} onChange={e => siteChange("email", e.target.value)} placeholder="correo@dominio.com"/></label>
            <label>Área de atención <input value={site.serviceArea} onChange={e => siteChange("serviceArea", e.target.value)}/></label>
          </div></div>
          <div className="admin-panel"><h3>Redes sociales y WhatsApp</h3><p className="admin-hint">Escribe los enlaces oficiales de Isabel. Los botones del menú flotante, el pie de página y Contacto se activan al publicar cambios. Los que dejes vacíos aparecerán como pendientes.</p>
            <div className="form-grid">
              <label>Facebook · URL HTTPS <input type="url" value={site.facebook} onChange={e => siteChange("facebook", e.target.value)} placeholder="https://www.facebook.com/perfil"/></label>
              <label>Instagram · URL HTTPS <input type="url" value={site.instagram} onChange={e => siteChange("instagram", e.target.value)} placeholder="https://www.instagram.com/perfil"/></label>
              <label>TikTok · URL HTTPS <input type="url" value={site.tiktok} onChange={e => siteChange("tiktok", e.target.value)} placeholder="https://www.tiktok.com/@perfil"/></label>
              <label>WhatsApp · teléfono con prefijo internacional <input type="tel" value={site.whatsapp} onChange={e => siteChange("whatsapp", e.target.value)} placeholder="505XXXXXXXX"/></label>
            </div>
            <div className="admin-social-preview"><span>VISTA PREVIA DE ICONOS</span><SocialLinks site={site} showLabels className="social-links--admin"/></div>
          </div>
          <div className="admin-form__actions"><button type="submit" disabled={saving} className="btn btn--dark">{saving ? "Guardando..." : "Publicar cambios"} <Save size={18}/></button></div>
        </form>
      </div>}
    </div>
  </main>;
}
