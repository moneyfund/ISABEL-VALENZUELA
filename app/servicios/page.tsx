"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, CircleCheck, Handshake, Home, Landmark, MapPinned, SearchCheck, Trees } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Reveal from "@/components/Reveal";
import { useSiteContent } from "@/lib/usePublic";

const offerings = [
  { number: "01", title: "Compra de propiedades", desc: "Acompañamiento en la búsqueda, selección y evaluación inicial de opciones alineadas con tus necesidades.", Icon: Home },
  { number: "02", title: "Venta de inmuebles", desc: "Una presentación cuidada de tu propiedad y una estrategia de comunicación para llegar a posibles interesados.", Icon: Handshake },
  { number: "03", title: "Terrenos y fincas", desc: "Explora propiedades rurales y lotes con características adecuadas para proyectos personales o de inversión.", Icon: Trees },
  { number: "04", title: "Inversión inmobiliaria", desc: "Identificación de alternativas y análisis preliminar de oportunidades en el mercado inmobiliario.", Icon: Landmark },
  { number: "05", title: "Locales y comercios", desc: "Búsqueda de espacios que respondan a los objetivos y al funcionamiento de diferentes actividades comerciales.", Icon: Building2 },
  { number: "06", title: "Orientación personalizada", desc: "Información y seguimiento durante el proceso; cuando corresponda, apoyo de profesionales especializados.", Icon: MapPinned }
];

export default function ServicesPage() {
  const { site } = useSiteContent();
  return <main className="subpage">
    <Navigation/>
    <section className="subpage__hero subpage__hero--services"><div className="container subpage__hero-inner">
      <p className="eyebrow eyebrow--gold">SERVICIOS INMOBILIARIOS</p><h1>Cada decisión merece <em>la atención correcta.</em></h1>
      <p>Un acompañamiento práctico, profesional y cercano para las diferentes necesidades inmobiliarias.</p><span className="subpage__hero-index">TU PROYECTO / NUESTRA PRIORIDAD</span>
    </div></section>
    <section className="services-page section-space"><div className="container">
      <Reveal className="section-heading"><div><p className="eyebrow eyebrow--dark"><span className="dot"/> CÓMO PUEDO AYUDARTE</p><h2>Un servicio adaptado <em>a ti.</em></h2></div><p>Desde la primera conversación hasta los siguientes pasos de tu operación inmobiliaria.</p></Reveal>
      <div className="services-page__grid">{offerings.map(({number,title,desc,Icon})=><article key={number}><div className="services-page__top"><Icon size={31} strokeWidth={1.6}/><span>{number}</span></div><h3>{title}</h3><p>{desc}</p><Link href="/contacto" aria-label={`Consultar sobre ${title}`}>Consultar <ArrowUpRight size={17}/></Link></article>)}</div>
    </div></section>
    <section className="process-section section-space"><div className="container process-section__grid"><Reveal><p className="eyebrow eyebrow--gold">UN PROCESO CLARO</p><h2>Así comienza <em>tu próxima etapa.</em></h2><p>Tu necesidad es el punto de partida. Cada paso se construye con información y una comunicación abierta.</p><Link className="btn btn--gold" href="/guias">Explorar guías <ArrowUpRight size={18}/></Link></Reveal><div className="process-steps">
      <div><span>01</span><div><SearchCheck size={22}/><h3>Conversemos</h3><p>Cuéntame qué buscas o qué propiedad deseas comercializar.</p></div></div>
      <div><span>02</span><div><CircleCheck size={22}/><h3>Exploramos opciones</h3><p>Revisamos alternativas e información relevante.</p></div></div>
      <div><span>03</span><div><Handshake size={22}/><h3>Definimos próximos pasos</h3><p>Avanzamos hacia una decisión con acompañamiento y claridad.</p></div></div>
    </div></div></section>
    <section className="services-cta"><div className="container"><h2>Tu próximo proyecto merece un <em>buen comienzo.</em></h2><Link href="/propiedades" className="btn btn--outline">Ver propiedades <ArrowRight size={18}/></Link></div></section>
    <Footer site={site}/>
  </main>;
}
