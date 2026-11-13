"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Search, ShieldCheck, Sparkles, MapPin } from "lucide-react";
import Navigation from "./Navigation";
import PropertyCard from "./PropertyCard";
import Reveal from "./Reveal";
import Footer from "./Footer";
import { subscribeProperties, subscribeSite } from "@/lib/repository";
import { defaultSite, type Property, type SiteContent } from "@/lib/models";
import { validImage } from "@/lib/format";

export default function Home() {
  const [site, setSite] = useState<SiteContent>(defaultSite);
  const [properties, setProperties] = useState<Property[]>([]);
  const [operation, setOperation] = useState("Todas");
  const [category, setCategory] = useState("Todas");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [error, setError] = useState("");
  useEffect(() => {
    const unsubProperties = subscribeProperties(setProperties, () => setError("No fue posible cargar las propiedades en este momento."));
    const unsubSite = subscribeSite(setSite, () => setError("No fue posible cargar el contenido actualizado."));
    return () => { unsubProperties(); unsubSite(); };
  }, []);
  const filtered = useMemo(() => properties.filter(item => {
    const q = search.trim().toLocaleLowerCase("es");
    return (operation === "Todas" || operation === item.operation)
      && (category === "Todas" || category === item.category)
      && (!q || `${item.title} ${item.city} ${item.location}`.toLocaleLowerCase("es").includes(q));
  }), [properties, operation, category, search]);

  return <main>
    <Navigation />
    <section id="inicio" className="hero">
      <img className="hero__photo" src={validImage(site.heroImage) ? site.heroImage : defaultSite.heroImage} alt="Arquitectura residencial contemporánea" fetchPriority="high" />
      <div className="hero__scrim" />
      <div className="hero__gridlines" aria-hidden="true" />
      <div className="container hero__layout">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow"><span className="eyebrow__line" /> {site.eyebrow}</p>
          <h1>{site.heroTitle}</h1>
          <p className="hero__desc">{site.heroSubtitle}</p>
          <a className="btn btn--gold" href="#propiedades">Explorar propiedades <ArrowUpRight size={19} /></a>
        </div>
        <div className="hero__side"><span>ISABEL VALENZUELA</span><span className="hero__side-stroke" /> <span>REAL ESTATE</span></div>
        <a href="#filtrar" className="hero__scroll"><span>DESLIZA PARA DESCUBRIR</span><ArrowDownRight size={20} /></a>
      </div>
      <div className="hero__counter"><span>01</span><span className="hero__counter-line" /><span>03</span></div>
    </section>

    <section id="filtrar" className="finder container" aria-label="Buscador de propiedades">
      <div className="finder__heading"><span className="finder__mark"><Search size={21} /></span><div><small>DESCUBRE TU PRÓXIMO ESPACIO</small><strong>Encuentra lo que buscas</strong></div></div>
      <div className="finder__fields">
        <label><span>OPERACIÓN</span><select value={operation} onChange={e => { setOperation(e.target.value); setVisibleCount(6); }}><option>Todas</option><option>Venta</option><option>Alquiler</option></select></label>
        <label><span>TIPO DE PROPIEDAD</span><select value={category} onChange={e => { setCategory(e.target.value); setVisibleCount(6); }}><option>Todas</option><option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Finca</option><option>Comercial</option></select></label>
        <label className="finder__search"><span>UBICACIÓN O PALABRA CLAVE</span><input value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(6); }} placeholder="Ciudad, zona, propiedad..." /></label>
        <a className="finder__button" href="#propiedades" aria-label="Ver resultados"><ArrowRight size={22} /></a>
      </div>
    </section>

    <section className="intro section-space">
      <div className="container intro__grid">
        <Reveal><p className="eyebrow eyebrow--dark"><span className="dot" /> ASESORÍA CON PROPÓSITO</p><h2>{site.introTitle}</h2></Reveal>
        <Reveal delay={140}><p className="intro__desc">{site.introDescription}</p><a href="#nosotros" className="text-link">Conoce mi enfoque <ArrowUpRight size={17} /></a></Reveal>
      </div>
    </section>

    <section id="propiedades" className="listings section-space">
      <div className="container">
        <Reveal className="section-heading">
          <div><p className="eyebrow eyebrow--dark"><span className="dot" /> COLECCIÓN INMOBILIARIA</p><h2>Espacios para <em>imaginar más.</em></h2></div>
          <p>Encuentra oportunidades que conectan con tus planes y tu estilo de vida.</p>
        </Reveal>
        {properties.some(p => p.demo) && <p className="demo-notice"><Sparkles size={17} /> Vista de demostración: las propiedades, precios e imágenes siguientes son ilustrativos y no constituyen ofertas reales.</p>}
        {error && <p className="status-error" role="alert">{error}</p>}
        <div className="properties-grid">
          {filtered.slice(0, visibleCount).map((property, i) => <PropertyCard property={property} index={i} key={property.id} />)}
        </div>
        {!error && filtered.length === 0 && <div className="empty-results"><Search size={34} /><h3>Aún no hay propiedades con estos criterios.</h3><p>Prueba otra ubicación o categoría.</p><button className="text-link" onClick={() => { setSearch(""); setOperation("Todas"); setCategory("Todas"); }}>Limpiar filtros <ArrowRight size={17} /></button></div>}
        {filtered.length > visibleCount && <div className="listings__more"><button className="btn btn--outline" onClick={() => setVisibleCount(c => c + 6)}>Descubrir más propiedades <ArrowRight size={19} /></button></div>}
      </div>
    </section>

    <section className="statement">
      <div className="container statement__inner"><span className="statement__index">01 / ASESORÍA</span><p>El lugar correcto no solo se encuentra. <em>Se reconoce.</em></p><span className="statement__ornament">IV</span></div>
    </section>

    <section id="nosotros" className="about section-space">
      <div className="container about__grid">
        <Reveal className="about__visual"><img src={validImage(site.aboutImage) ? site.aboutImage : defaultSite.aboutImage} loading="lazy" alt="Retrato de Isabel Valenzuela" /><span className="about__image-caption">UNA MIRADA DIFERENTE SOBRE LOS ESPACIOS</span></Reveal>
        <Reveal className="about__content" delay={150}>
          <p className="eyebrow eyebrow--dark"><span className="dot" /> CONOCE A ISABEL</p>
          <h2>{site.aboutTitle}</h2>
          <p>{site.aboutDescription}</p>
          <div className="about__values">
            <div><ShieldCheck size={24} /><span>Confianza en cada decisión</span></div>
            <div><MapPin size={24} /><span>Acompañamiento local</span></div>
            <div><Sparkles size={24} /><span>Atención a cada detalle</span></div>
          </div>
          <a href="#contacto" className="text-link">Conversemos sobre tu proyecto <ArrowUpRight size={17} /></a>
        </Reveal>
      </div>
    </section>
    <Footer site={site} />
  </main>;
}
