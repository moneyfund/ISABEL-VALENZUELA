import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin } from "lucide-react";
import Brand from "./Brand";
import { digits } from "@/lib/format";
import type { SiteContent } from "@/lib/models";

export default function Footer({ site }: { site: SiteContent }) {
  const phone = digits(site.whatsapp);
  return <footer id="contacto" className="footer">
    <div className="container">
      <div className="footer__top">
        <div>
          <p className="eyebrow eyebrow--gold">LA SIGUIENTE ETAPA COMIENZA AQUÍ</p>
          <h2>Hablemos de lo que<br /><em>estás buscando.</em></h2>
        </div>
        <div className="footer__contact">
          <p>Una conversación puede ser el primer paso hacia tu próxima propiedad.</p>
          {phone ? <a className="btn btn--gold" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phone}`}>Conversemos por WhatsApp <ArrowUpRight size={18} /></a> :
            site.email ? <a className="btn btn--gold" href={`mailto:${site.email}`}>Escríbeme un correo <ArrowUpRight size={18} /></a> :
            <span className="footer__pending">Canales de contacto en preparación</span>}
        </div>
      </div>
      <div className="footer__middle">
        <div><Brand compact /><p>Bienes raíces con criterio, cercanía y confianza.</p></div>
        <div className="footer__links">
          <Link href="/#inicio">Inicio</Link><Link href="/#propiedades">Propiedades</Link><Link href="/#nosotros">Sobre Isabel</Link>
        </div>
        <div className="footer__social">
          <span><MapPin size={15} /> {site.serviceArea}</span>
          {site.email && <a href={`mailto:${site.email}`}><Mail size={15} /> {site.email}</a>}
          {site.instagram?.startsWith("https://") && <a href={site.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={15} /> Instagram</a>}
        </div>
      </div>
      <div className="footer__bottom"><span>© {new Date().getFullYear()} Isabel Valenzuela. Todos los derechos reservados.</span><span>DISEÑO Y DESARROLLO POR <strong>XARCON</strong></span></div>
    </div>
  </footer>;
}
