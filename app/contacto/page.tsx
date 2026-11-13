"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Facebook, Instagram, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteContent } from "@/lib/usePublic";
import { contactEmail, safeSocialUrl, whatsappUrl } from "@/lib/social";

const channels = [
  { key: "whatsapp", name: "WhatsApp", description: "Conversemos directamente sobre lo que necesitas.", Icon: MessageCircle },
  { key: "facebook", name: "Facebook", description: "Descubre novedades y publicaciones inmobiliarias.", Icon: Facebook },
  { key: "instagram", name: "Instagram", description: "Inspírate con fotografías y propiedades.", Icon: Instagram },
  { key: "tiktok", name: "TikTok", description: "Contenido e ideas sobre espacios inmobiliarios.", Icon: Send }
] as const;

export default function ContactPage() {
  const { site } = useSiteContent();
  const email = contactEmail(site.email);
  const urls: Record<string, string | null> = {
    whatsapp: whatsappUrl(site.whatsapp), facebook: safeSocialUrl("facebook",site.facebook),
    instagram: safeSocialUrl("instagram",site.instagram), tiktok: safeSocialUrl("tiktok",site.tiktok)
  };
  return <main className="subpage">
    <Navigation/>
    <section className="subpage__hero subpage__hero--contact"><div className="container subpage__hero-inner">
      <p className="eyebrow eyebrow--gold">HABLEMOS DE TU PRÓXIMO PASO</p>
      <h1>Tu consulta es el inicio de <em>algo importante.</em></h1>
      <p>¿Comprar, vender o explorar posibilidades? Isabel estará encantada de conocer lo que tienes en mente.</p>
      <span className="subpage__hero-index">ESCRÍBENOS / ISABEL VALENZUELA</span>
    </div></section>
    <section className="contact-page section-space"><div className="container contact-page__grid">
      <div className="contact-page__intro"><p className="eyebrow eyebrow--dark"><span className="dot"/> CONTACTO PERSONAL</p><h2>Hablemos de lo que <em>te inspira.</em></h2><p>No importa si ya tienes una propiedad en mente o si todavía estás descubriendo tus opciones. El primer paso es conversar.</p>
        <div className="contact-page__facts">
          <div><MapPin size={22}/><div><strong>Área de atención</strong><span>{site.serviceArea}</span></div></div>
          <div><Mail size={22}/><div><strong>Correo electrónico</strong>{email?<a href={`mailto:${email}`}>{email}</a>:<span>Pendiente de configurar</span>}</div></div>
        </div>
        {urls.whatsapp && <a className="btn btn--dark" target="_blank" rel="noopener noreferrer" href={urls.whatsapp}>Enviar mensaje por WhatsApp <ArrowUpRight size={18}/></a>}
        <Link href="/propiedades" className="text-link">Ver el catálogo <ArrowRight size={17}/></Link>
      </div>
      <div className="contact-page__channels">
        <p className="eyebrow eyebrow--gold">CANALES OFICIALES</p><h3>Elige cómo prefieres conectar.</h3>
        {channels.map(({key,name,description,Icon}) => urls[key]
          ? <a className="contact-page__channel" href={urls[key]!} key={key} target="_blank" rel="noopener noreferrer"><span className="contact-page__icon"><Icon size={24}/></span><span><strong>{name}</strong><small>{description}</small></span><ArrowUpRight size={20}/></a>
          : <div className="contact-page__channel contact-page__channel--disabled" key={key}><span className="contact-page__icon"><Icon size={24}/></span><span><strong>{name}</strong><small>Enlace disponible próximamente</small></span></div>)}
        <small className="contact-page__note">Los enlaces son gestionados desde el panel privado de Isabel.</small>
      </div>
    </div></section>
    <Footer site={site}/>
  </main>;
}
