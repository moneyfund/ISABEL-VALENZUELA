"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin, BedDouble, Bath, Ruler, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getProperty, subscribeSite } from "@/lib/repository";
import { defaultSite, type Property, type SiteContent } from "@/lib/models";
import { contactLink, money, validImage } from "@/lib/format";

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [site, setSite] = useState<SiteContent>(defaultSite);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    let active = true;
    getProperty(params.id).then(p => { if (active) { setProperty(p); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    const unsubscribe = subscribeSite(setSite, () => {});
    return () => { active = false; unsubscribe(); };
  }, [params.id]);
  const images = property?.images?.filter(validImage) || [];
  const contact = property && !property.demo ? contactLink(site.whatsapp, site.email, property.title) : null;

  return <main className="detail-page">
    <Navigation />
    <div className="detail-page__topbar"><div className="container"><Link href="/#propiedades"><ArrowLeft size={17} /> Volver a propiedades</Link><span>ISABEL VALENZUELA / BIENES RAÍCES</span></div></div>
    <div className="container detail-page__main">
      {loading ? <div className="detail-state">Cargando propiedad…</div> : !property ? <div className="detail-state"><h1>Esta propiedad no está disponible.</h1><p>Es posible que haya sido retirada o que aún no esté publicada.</p><Link className="btn btn--dark" href="/#propiedades">Volver al catálogo <ArrowUpRight size={17} /></Link></div> : <>
        <div className="detail-page__heading"><div><p className="eyebrow eyebrow--dark">{property.category} / {property.operation}</p><h1>{property.title}</h1><p><MapPin size={17} /> {property.location}</p></div><div className="detail-page__price"><small>PRECIO DE {property.operation.toUpperCase()}</small><strong>{money(property.price)}</strong></div></div>
        {property.demo && <p className="demo-notice">PROPIEDAD DE DEMOSTRACIÓN. Datos, fotografías y precio exclusivamente ilustrativos; no está en venta ni alquiler.</p>}
        <div className="detail-gallery">
          <div className="detail-gallery__main"><img src={images[imageIndex] || "/property-fallback.svg"} alt={property.title} /></div>
          {images.length > 1 && <div className="detail-gallery__thumbs">{images.map((src, i) => <button className={i === imageIndex ? "active" : ""} key={src + i} onClick={() => setImageIndex(i)} aria-label={`Ver foto ${i + 1}`}><img src={src} alt={`Vista ${i + 1}`} /></button>)}</div>}
        </div>
        <div className="detail-page__columns">
          <div className="detail-page__description"><p className="eyebrow eyebrow--dark">ACERCA DE LA PROPIEDAD</p><h2>Un espacio para lo que viene.</h2><p>{property.description}</p><h3>Características principales</h3><div className="detail-features"><span><Ruler size={22} />{property.area} m² de construcción / superficie</span>{property.landArea ? <span><Ruler size={22} />{property.landArea} m² de terreno</span> : null}{property.bedrooms > 0 && <span><BedDouble size={22} />{property.bedrooms} habitaciones</span>}{property.bathrooms > 0 && <span><Bath size={22} />{property.bathrooms} baños</span>}</div>{property.highlights.length > 0 && <div className="detail-highlights">{property.highlights.map(h => <span key={h}><CheckCircle2 size={17} /> {h}</span>)}</div>}</div>
          <aside className="detail-page__aside"><p className="eyebrow eyebrow--gold">AGENDA UNA CONVERSACIÓN</p><h3>¿Es este tu próximo espacio?</h3><p>Conoce los detalles, consulta disponibilidad y recibe acompañamiento durante el proceso.</p>{contact ? <a className="btn btn--gold" target={contact.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" href={contact}>Solicitar información <ArrowUpRight size={17} /></a> : <span className="aside-pending">{property.demo ? "Ficha ilustrativa · no disponible para consultas" : "Contacto pendiente de configurar"}</span>}</aside>
        </div>
      </>}
    </div>
    <Footer site={site} />
  </main>;
}
