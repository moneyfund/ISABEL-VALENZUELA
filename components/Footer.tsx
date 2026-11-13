import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Brand from "./Brand";
import SocialLinks from "./SocialLinks";
import { contactEmail, whatsappUrl } from "@/lib/social";
import type { SiteContent } from "@/lib/models";

export default function Footer({ site }: { site: SiteContent }) {
  const whatsapp = whatsappUrl(site.whatsapp);
  const email = contactEmail(site.email);
  return <footer id="contacto" className="footer">
    <div className="container">
      <div className="footer__top">
        <div><p className="eyebrow eyebrow--gold">LA SIGUIENTE ETAPA COMIENZA AQUÍ</p><h2>Hablemos de lo que<br/><em>estás buscando.</em></h2></div>
        <div className="footer__contact"><p>Una conversación puede ser el primer paso hacia tu próxima propiedad.</p>
          {whatsapp ? <a className="btn btn--gold" target="_blank" rel="noopener noreferrer" href={whatsapp}>Conversemos por WhatsApp <ArrowUpRight size={18}/></a>
            : email ? <a className="btn btn--gold" href={`mailto:${email}`}>Escríbeme un correo <ArrowUpRight size={18}/></a>
            : <Link className="btn btn--gold" href="/contacto">Ver medios de contacto <ArrowUpRight size={18}/></Link>}
        </div>
      </div>
      <div className="footer__middle">
        <div><Brand compact/><p>Bienes raíces con criterio, cercanía y confianza.</p><SocialLinks site={site} className="social-links--footer"/></div>
        <div className="footer__links">
          <Link href="/">Inicio</Link><Link href="/propiedades">Propiedades</Link><Link href="/servicios">Servicios</Link><Link href="/sobre-isabel">Sobre Isabel</Link><Link href="/contacto">Contacto</Link>
        </div>
        <div className="footer__social"><span><MapPin size={15}/> {site.serviceArea}</span>
          {email && <a href={`mailto:${email}`}><Mail size={15}/> {email}</a>}
          <Link href="/contacto">Todos mis canales <ArrowUpRight size={15}/></Link>
        </div>
      </div>
      <div className="footer__bottom"><span>© {new Date().getFullYear()} Isabel Valenzuela. Todos los derechos reservados.</span><span>DISEÑO Y DESARROLLO POR <strong>XARCON</strong></span></div>
    </div>
  </footer>;
}
