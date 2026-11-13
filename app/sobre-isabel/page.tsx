"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Reveal from "@/components/Reveal";
import SocialLinks from "@/components/SocialLinks";
import { useSiteContent } from "@/lib/usePublic";
import { defaultSite } from "@/lib/models";
import { validImage } from "@/lib/format";

export default function AboutPage() {
  const { site } = useSiteContent();
  return <main className="subpage">
    <Navigation />
    <section className="subpage__hero subpage__hero--about"><div className="container subpage__hero-inner">
      <p className="eyebrow eyebrow--gold">CONOCE A ISABEL VALENZUELA</p>
      <h1>Un trato personal. <em>Una conexión real.</em></h1>
      <p>Personas primero. Propiedades con propósito.</p>
      <span className="subpage__hero-index">TU ASESORA INMOBILIARIA</span>
    </div></section>
    <section className="about-profile section-space"><div className="container about-profile__grid">
      <Reveal className="about-profile__photo">
        <div className="about-profile__image"><img src={validImage(site.aboutImage) ? site.aboutImage : defaultSite.aboutImage} alt="Isabel Valenzuela, agente inmobiliaria" /></div>
        <span>ISABEL VALENZUELA <span>·</span> BIENES RAÍCES</span>
      </Reveal>
      <Reveal className="about-profile__copy" delay={100}>
        <p className="eyebrow eyebrow--dark"><span className="dot"/> UN COMPROMISO PERSONAL</p>
        <h2>{site.aboutTitle}</h2>
        <p>{site.aboutDescription}</p>
        <div className="about-profile__quote"><span>“</span><p>Una buena decisión inmobiliaria comienza con información clara y una conversación de confianza.</p></div>
        <Link className="btn btn--dark" href="/contacto">Conversemos <ArrowUpRight size={18}/></Link>
      </Reveal>
    </div></section>
    <section className="principles section-space"><div className="container">
      <Reveal className="section-heading"><div><p className="eyebrow eyebrow--dark"><span className="dot"/> MI FORMA DE TRABAJAR</p><h2>Lo importante no es solo <em>encontrar.</em></h2></div><p>La atención a los detalles cambia la experiencia de compra, venta o búsqueda.</p></Reveal>
      <div className="principles__grid">
        <article><ShieldCheck size={35}/><span>01</span><h3>Claridad</h3><p>Explicaciones sencillas y comunicación directa para tomar decisiones informadas.</p></article>
        <article><HeartHandshake size={35}/><span>02</span><h3>Cercanía</h3><p>Escuchar primero, comprender tus prioridades y acompañar el proceso.</p></article>
        <article><Compass size={35}/><span>03</span><h3>Visión</h3><p>Explorar espacios pensando también en sus posibilidades a largo plazo.</p></article>
        <article><BadgeCheck size={35}/><span>04</span><h3>Compromiso</h3><p>Atención responsable a cada consulta y a cada paso del camino.</p></article>
      </div>
    </div></section>
    <section className="about-social section-space"><div className="container about-social__inner"><div><p className="eyebrow eyebrow--gold">ESTAMOS EN CONTACTO</p><h2>También podemos hablar <em>en redes.</em></h2><p>Descubre novedades o inicia una conversación desde tu canal preferido.</p><SocialLinks site={site} className="social-links--large" showLabels/></div><Link className="btn btn--gold" href="/propiedades">Explorar propiedades <ArrowRight size={18}/></Link></div></section>
    <Footer site={site}/>
  </main>;
}
