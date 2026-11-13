"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Building2, Home as HomeIcon, MapPin, Search, ShieldCheck, Trees } from "lucide-react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import PropertyCard from "./PropertyCard";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";
import { usePublicProperties, useSiteContent } from "@/lib/usePublic";
import { defaultSite } from "@/lib/models";
import { validImage } from "@/lib/format";

export default function Home() {
  const router = useRouter();
  const { site } = useSiteContent();
  const { properties, loading } = usePublicProperties();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Todas");
  const [operation, setOperation] = useState("Venta");

  const selection = properties.filter(p => p.featured).length
    ? properties.filter(p => p.featured).slice(0, 3)
    : properties.slice(0, 3);
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (keyword.trim()) query.set("q", keyword.trim());
    if (category !== "Todas") query.set("tipo", category);
    if (operation !== "Todas") query.set("operacion", operation);
    router.push(`/propiedades${query.size ? "?" + query.toString() : ""}`);
  }

  return <main>
    <Navigation />
    <section id="inicio" className="hero hero--v2">
      <div className="hero__gallery" aria-hidden="true">
        <img src={validImage(site.heroImage) ? site.heroImage : defaultSite.heroImage} alt="" className="hero__frame hero__frame--one" />
        <img src={validImage(site.heroImage2) ? site.heroImage2 : defaultSite.heroImage2} alt="" className="hero__frame hero__frame--two" />
        <img src={validImage(site.heroImage3) ? site.heroImage3 : defaultSite.heroImage3} alt="" className="hero__frame hero__frame--three" />
      </div>
      <div className="hero__scrim hero__scrim--v2" />
      <div className="hero__architecture" aria-hidden="true">
        <span className="hero__ring hero__ring--a" /><span className="hero__ring hero__ring--b" />
        <span className="hero__line hero__line--one"/><span className="hero__line hero__line--two"/>
      </div>
      <div className="container hero__layout hero__layout--v2">
        <div className="hero__copy hero__copy--v2">
          <p className="eyebrow hero__eyebrow"><span className="eyebrow__line" />{site.eyebrow}</p>
          <p className="hero__pretitle">ISABEL VALENZUELA <span>·</span> AGENTE INMOBILIARIA</p>
          <h1>{site.heroTitle}</h1>
          <p className="hero__desc">{site.heroSubtitle}</p>
          <div className="hero__actions"><Link className="btn btn--gold" href="/propiedades">Explorar propiedades <ArrowUpRight size={19}/></Link><Link className="btn btn--glass" href="/contacto">Recibe asesoría <ArrowRight size={18}/></Link></div>
        </div>
        <div className="hero__profile" aria-label="Conoce a Isabel Valenzuela">
          <div className="hero__portrait"><img src="/isabel-valenzuela.webp" alt="Isabel Valenzuela, asesora inmobiliaria" /></div>
          <div className="hero__profile-copy"><span>ATENCIÓN PERSONALIZADA</span><strong>Isabel Valenzuela</strong><Link href="/sobre-isabel">Conócela <ArrowUpRight size={15}/></Link></div>
        </div>
        <div className="hero__floating"><span className="hero__floating-dot"/><span>DESCUBRE LA PROPIEDAD<br/>QUE VA CONTIGO</span></div>
        <div className="hero__scroll"><span>EXPLORA LA EXPERIENCIA</span><ArrowDownRight size={19}/></div>
      </div>
      <SocialLinks site={site} className="social-links--floating" />
      <div className="hero__gallery-indicator"><span>01</span><span className="hero__indicator-track"><span /></span><span>03</span></div>
    </section>

    <form onSubmit={search} className="finder finder--v2 container" aria-label="Buscar propiedades">
      <div className="finder__heading"><span className="finder__mark"><Search size={20}/></span><div><small>EXPLORA TU PRÓXIMO ESPACIO</small><strong>¿Qué propiedad buscas?</strong></div></div>
      <div className="finder__fields">
        <label><span>OPERACIÓN</span><select aria-label="Operación" value={operation} onChange={e=>setOperation(e.target.value)}><option>Venta</option><option>Alquiler</option><option>Todas</option></select></label>
        <label><span>TIPO</span><select aria-label="Tipo de propiedad" value={category} onChange={e=>setCategory(e.target.value)}><option>Todas</option><option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Finca</option><option>Comercial</option></select></label>
        <label className="finder__search"><span>UBICACIÓN / REFERENCIA</span><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="Ciudad, sector, referencia..." /></label>
        <button type="submit" className="finder__button" aria-label="Buscar propiedades"><ArrowRight size={23}/></button>
      </div>
    </form>

    <section className="hero-values"><div className="container hero-values__grid">
      <div><ShieldCheck/><span><strong>Trato cercano</strong><small>Acompañamiento en cada etapa</small></span></div>
      <div><BadgeCheck/><span><strong>Información clara</strong><small>Decisiones con confianza</small></span></div>
      <div><MapPin/><span><strong>Conocimiento local</strong><small>Oportunidades en Nicaragua</small></span></div>
    </div></section>

    <section className="intro section-space"><div className="container intro__grid">
      <Reveal><p className="eyebrow eyebrow--dark"><span className="dot"/> ASESORÍA CON PROPÓSITO</p><h2>{site.introTitle}</h2></Reveal>
      <Reveal delay={120}><p className="intro__desc">{site.introDescription}</p><Link className="text-link" href="/sobre-isabel">Conoce a Isabel <ArrowUpRight size={17}/></Link></Reveal>
    </div></section>

    <section className="listings section-space"><div className="container">
      <Reveal className="section-heading"><div><p className="eyebrow eyebrow--dark"><span className="dot"/> SELECCIÓN INMOBILIARIA</p><h2>Propiedades <em>destacadas.</em></h2></div><Link className="text-link" href="/propiedades">Ver catálogo completo <ArrowUpRight size={17}/></Link></Reveal>
      {selection.some(p => p.demo) && <p className="demo-notice">Estas fichas son demostrativas; los precios y las imágenes no corresponden a ofertas inmobiliarias reales.</p>}
      <div className="properties-grid">{selection.map((p,i)=><PropertyCard key={p.id} property={p} index={i}/>)}</div>
      {!loading && selection.length === 0 && <div className="empty-results"><h3>Pronto encontrarás nuevas oportunidades.</h3><Link className="text-link" href="/contacto">Consulta directamente <ArrowUpRight size={17}/></Link></div>}
      <div className="listings__more"><Link href="/propiedades" className="btn btn--outline">Explorar todas las propiedades <ArrowUpRight size={18}/></Link></div>
    </div></section>

    <section className="statement"><div className="container statement__inner"><span className="statement__index">01 / MI COMPROMISO</span><p>El lugar correcto no solo se encuentra. <em>Se reconoce.</em></p><span className="statement__ornament">IV</span></div></section>

    <section className="home-services section-space"><div className="container">
      <Reveal className="section-heading"><div><p className="eyebrow eyebrow--dark"><span className="dot"/> CÓMO PUEDO AYUDARTE</p><h2>Más que propiedades. <em>Asesoría.</em></h2></div><p>Una experiencia diseñada alrededor de lo que realmente necesitas.</p></Reveal>
      <div className="home-services__grid">
        <Link href="/servicios"><HomeIcon size={30}/><span>01</span><h3>Compra y venta</h3><p>Orientación en la búsqueda o comercialización de propiedades.</p><ArrowUpRight className="home-services__arrow"/></Link>
        <Link href="/servicios"><Trees size={30}/><span>02</span><h3>Terrenos y fincas</h3><p>Explora alternativas para inversión, desarrollo o uso personal.</p><ArrowUpRight className="home-services__arrow"/></Link>
        <Link href="/servicios"><Building2 size={30}/><span>03</span><h3>Espacios comerciales</h3><p>Opciones inmobiliarias para proyectos y actividades empresariales.</p><ArrowUpRight className="home-services__arrow"/></Link>
      </div>
    </div></section>

    <section className="home-about"><div className="container home-about__inner">
      <div className="home-about__photo"><img src="/isabel-valenzuela.webp" alt="Retrato profesional de Isabel Valenzuela" loading="lazy"/><span>ISABEL VALENZUELA</span></div>
      <div className="home-about__copy"><p className="eyebrow eyebrow--gold">UNA PERSONA DETRÁS DE CADA DECISIÓN</p><h2>{site.aboutTitle}</h2><p>{site.aboutDescription}</p><Link className="btn btn--gold" href="/sobre-isabel">Conoce mi historia <ArrowUpRight size={18}/></Link></div>
    </div></section>

    <Footer site={site}/>
  </main>;
}
