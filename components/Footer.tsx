import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Brand from "./Brand";
import SocialLinks from "./SocialLinks";
import { whatsappUrl } from "@/lib/social";
import type { SiteContent } from "@/lib/models";

export default function Footer({ site }: { site: SiteContent }) {
  const whatsapp = whatsappUrl(site.whatsapp);
  return <footer className="iv-footer" id="contacto">
    <div className="container iv-footer__inner">
      <div className="iv-footer__brand">
        <Brand compact />
        <p>Agente inmobiliaria en Nicaragua.</p>
        <SocialLinks site={site} />
      </div>
      <nav aria-label="Enlaces del pie de página" className="iv-footer__nav">
        <Link href="/">Inicio</Link>
        <Link href="/propiedades">Propiedades</Link>
        <Link href="/servicios">Servicios</Link>
        <Link href="/sobre-isabel">Sobre Isabel</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>
      <div className="iv-footer__contact">
        <p>¿Conversamos?</p>
        {whatsapp ? <a target="_blank" rel="noopener noreferrer" href={whatsapp}>WhatsApp <ArrowUpRight size={17}/></a> : <Link href="/contacto">Escribime <ArrowUpRight size={17}/></Link>}
      </div>
    </div>
    <div className="container iv-footer__bottom">
      <span>© {new Date().getFullYear()} Isabel Valenzuela.</span>
      <span>Diseño y desarrollo por <strong>XARCON</strong></span>
    </div>
  </footer>;
}
