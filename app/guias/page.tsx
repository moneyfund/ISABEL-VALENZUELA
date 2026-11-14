"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, HandCoins, House, KeyRound, ShieldCheck, MoveUpRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/lib/usePublic";
import { guideCatalog } from "@/lib/guia-servicios";

const entries=[
  {id:"compra", Icon:House, eyebrow:"PARA COMPRADORES",image:"/isabel-emblema.svg"},
  {id:"venta",Icon:HandCoins,eyebrow:"PARA PROPIETARIOS",image:"/isabel-emblema.svg"},
  {id:"buscar-renta",Icon:KeyRound,eyebrow:"PARA NEGOCIOS",image:"/isabel-emblema.svg"},
  {id:"ofrecer-renta",Icon:Building2,eyebrow:"PARA ARRENDADORES",image:"/isabel-emblema.svg"}
] as const;

export default function GuidesPage(){
  const {site}=useSiteContent();
  return <main className="guides-index">
    <Navigation/>
    <header className="guides-index__hero">
      <div className="container">
        <p className="guides-index__eyebrow"><span/>ASESORÍA INMOBILIARIA</p>
        <h1>Una guía para <em>cada decisión.</em></h1>
        <p>Elegí lo que necesitás. Te ayudaremos a organizar tus requisitos y próximos pasos de forma sencilla.</p>
        <div className="guides-index__assurance"><ShieldCheck size={17}/> Información personalizada, sin costo.</div>
      </div>
    </header>
    <section className="guides-index__selection">
      <div className="container">
        <div className="guides-index__heading">
          <div><span>EMPEZÁ POR TU OBJETIVO</span><h2>¿En qué podemos ayudarte?</h2></div>
          <p>Seleccioná una guía para comenzar. El formulario aparecerá después de elegir.</p>
        </div>
        <div className="guides-index__cards">
          {entries.map(({id,Icon,eyebrow})=>{
            const guide=guideCatalog[id];
            return <Link key={id} href={guide.href} className="guides-index__card" aria-label={guide.title}>
              <div className="guides-index__card-head"><span>{guide.number} / {eyebrow}</span><MoveUpRight size={22}/></div>
              <div className="guides-index__icon"><Icon size={38} strokeWidth={1.25}/></div>
              <div className="guides-index__card-foot">
                <h3>{guide.title}</h3>
                <p>{guide.subtitle}</p>
                <span>Empezar guía <ArrowUpRight size={17}/></span>
              </div>
            </Link>;
          })}
        </div>
        <p className="guides-index__privacy"><ShieldCheck size={17}/> No necesitás crear una cuenta. Solo al enviar la guía, y con tu autorización, Isabel podrá ver los datos necesarios para asesorarte.</p>
      </div>
    </section>
    <Footer site={site}/>
  </main>;
}
