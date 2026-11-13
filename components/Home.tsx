"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, MapPin, Search, MessageCircle } from "lucide-react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import PropertyCard from "./PropertyCard";
import SocialLinks from "./SocialLinks";
import { usePublicProperties, useSiteContent } from "@/lib/usePublic";
import { whatsappUrl } from "@/lib/social";
import { defaultSite } from "@/lib/models";
import { validImage } from "@/lib/format";

const oldHeadlines = new Set([
  "Espacios que inspiran. Decisiones que trascienden.",
  "Encuentra tu próximo espacio."
]);

export default function Home() {
  const router = useRouter();
  const { site } = useSiteContent();
  const { properties, loading } = usePublicProperties();
  const [keyword, setKeyword] = useState("");
  const selection = properties.filter(p => p.featured).length
    ? properties.filter(p => p.featured).slice(0, 3)
    : properties.slice(0, 3);
  const title = !site.heroTitle?.trim() || oldHeadlines.has(site.heroTitle.trim())
    ? "Encontrá tu lugar." : site.heroTitle;
  const whatsapp = whatsappUrl(site.whatsapp);
  const subtitle = site.heroSubtitle && site.heroSubtitle !== "Acompañamiento inmobiliario cercano, criterio profesional y una selección pensada para tu próxima etapa."
    ? site.heroSubtitle : "Compra, venta e inversión inmobiliaria en Nicaragua.";
  const introTitle = site.introTitle === "Cada propiedad es el comienzo de una historia."
    ? "Un trato cercano. Una decisión importante." : site.introTitle;
  const introDescription = site.introDescription === "Explora espacios con potencial y encuentra asesoría personal durante cada etapa de tu decisión inmobiliaria."
    ? "Te acompaño a encontrar, comprar o vender tu propiedad con claridad y atención personal." : site.introDescription;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = keyword.trim();
    router.push(search ? `/propiedades?q=${encodeURIComponent(search)}` : "/propiedades");
  }

  return <main className="site-redesign">
    <Navigation />

    <section className="iv-hero" aria-labelledby="iv-hero-title">
      <div className="iv-hero__background" aria-hidden="true">
        <img src={validImage(site.heroImage) ? site.heroImage : defaultSite.heroImage} alt="" />
      </div>
      <div className="iv-hero__portrait-wrap">
        <img src="/isabel-valenzuela.webp" alt="Isabel Valenzuela, agente inmobiliaria" className="iv-hero__portrait" fetchPriority="high" />
        <span className="iv-hero__portrait-label">Isabel Valenzuela</span>
      </div>
      <div className="container iv-hero__container">
        <div className="iv-hero__content">
          <p className="iv-hero__kicker"><span /> ISABEL VALENZUELA | BIENES RAÍCES</p>
          <h1 id="iv-hero-title">{title}</h1>
          <p className="iv-hero__subtitle">{subtitle}</p>
          <div className="iv-hero__actions">
            <Link href="/propiedades" className="iv-hero__primary">Ver propiedades <ArrowUpRight size={18}/></Link>
            {whatsapp && <a className="iv-hero__whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19}/> WhatsApp</a>}
          </div>
          <form className="iv-hero__search" onSubmit={handleSearch} role="search">
            <Search size={21} aria-hidden="true"/>
            <label htmlFor="iv-search" className="sr-only">Buscar propiedad, ubicación o referencia</label>
            <input id="iv-search" placeholder="Buscá por ubicación o propiedad" value={keyword} onChange={e => setKeyword(e.target.value)} />
            <button type="submit">Buscar <ArrowRight size={17}/></button>
          </form>
        </div>
      </div>
      <div className="iv-hero__social"><SocialLinks site={site} /></div>
      <div className="iv-hero__count">ISABEL VALENZUELA <span> / </span> NICARAGUA</div>
    </section>

    <section className="iv-featured" id="propiedades">
      <div className="container">
        <div className="iv-featured__heading">
          <div><p className="iv-eyebrow">PORTAFOLIO INMOBILIARIO</p><h2>Propiedades destacadas</h2></div>
          <Link href="/propiedades" className="iv-simple-link">Ver todas <ArrowUpRight size={18}/></Link>
        </div>
        {selection.some(p => p.demo) && <p className="iv-demo-note">Propiedades de demostración. Precios y características ilustrativos, no son ofertas reales.</p>}
        <div className="iv-featured__grid">
          {selection.map((property, i) => <PropertyCard key={property.id} property={property} index={i}/>)}
        </div>
        {!loading && !selection.length && <div className="iv-empty"><p>Muy pronto, nuevas propiedades.</p><Link href="/contacto">Consultar disponibilidad <ArrowUpRight size={16}/></Link></div>}
      </div>
    </section>

    <section className="iv-introduction">
      <div className="container iv-introduction__inner">
        <div>
          <p className="iv-eyebrow">SOBRE ISABEL</p>
          <h2>{introTitle}</h2>
        </div>
        <div className="iv-introduction__right">
          <p>{introDescription}</p>
          <Link href="/sobre-isabel" className="iv-simple-link iv-simple-link--light">Conocé mi trabajo <ArrowUpRight size={18}/></Link>
        </div>
      </div>
    </section>

    <section className="iv-inquiry">
      <div className="container iv-inquiry__inner">
        <div><span>¿TENÉS UNA PROPIEDAD PARA VENDER?</span><h2>Hablemos de ella.</h2></div>
        <Link href="/contacto" className="iv-inquiry__button">Contactar a Isabel <ArrowUpRight size={18}/></Link>
      </div>
    </section>
    <Footer site={site}/>
  </main>;
}
