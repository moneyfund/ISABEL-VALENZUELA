import Link from "next/link";
import { ArrowUpRight, BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { money, validImage } from "@/lib/format";
import type { Property } from "@/lib/models";

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const cover = property.images?.find(validImage) || "/property-fallback.svg";
  return (
    <article className="property-card" style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}>
      <Link className="property-card__media" href={`/propiedades/${encodeURIComponent(property.id)}`} aria-label={`Ver ${property.title}`}>
        <img src={cover} alt={property.title} loading="lazy" />
        <div className="property-card__badges">
          <span>{property.operation}</span>
          {property.demo && <span className="badge-demo">DEMO</span>}
        </div>
        <span className="property-card__arrow"><ArrowUpRight size={20} /></span>
      </Link>
      <div className="property-card__content">
        <p className="property-card__type">{property.category} <span>·</span> {property.operation}</p>
        <Link href={`/propiedades/${encodeURIComponent(property.id)}`}><h3>{property.title}</h3></Link>
        <p className="property-card__location"><MapPin size={14} /> {property.location}</p>
        <div className="property-card__facts">
          <span><Ruler size={17} /> {new Intl.NumberFormat("es-NI").format(property.area)} m²</span>
          {property.bedrooms > 0 && <span><BedDouble size={17} /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span><Bath size={17} /> {property.bathrooms}</span>}
        </div>
        <div className="property-card__bottom"><strong>{money(property.price)}</strong><span>Ver detalles <ArrowUpRight size={14} /></span></div>
      </div>
    </article>
  );
}
