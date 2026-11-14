import Link from "next/link";
import { ArrowUpRight, BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { money, validImage } from "@/lib/format";
import type { Property } from "@/lib/models";
import { hasBedrooms, hasBathrooms, propertyAreaLabel } from "@/lib/property-details";

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const cover = property.images?.find(validImage) || "/property-fallback.svg";
  return <article className="iv-estate" style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}>
    <Link href={`/propiedades/${encodeURIComponent(property.id)}`} className="iv-estate__link" aria-label={`Ver ${property.title}`}>
      <div className="iv-estate__image-wrap">
        <img src={cover} alt={property.title} loading="lazy" />
        <span className="iv-estate__tag">{property.category} · {property.operation}</span>
        {property.demo && <span className="iv-estate__demo">DEMO</span>}
        <span className="iv-estate__open"><ArrowUpRight size={22} /></span>
      </div>
      <div className="iv-estate__text">
        <span className="iv-estate__place"><MapPin size={14}/>{property.location}</span>
        <h3>{property.title}</h3>
        <div className="iv-estate__bottom">
          <strong>{money(property.price)}</strong>
          <span className="iv-estate__facts"><span><Ruler size={15}/>{propertyAreaLabel(property)}</span>
            {hasBedrooms(property.category) && property.bedrooms > 0 && <span><BedDouble size={15}/>{property.bedrooms}</span>}
            {hasBathrooms(property.category) && property.bathrooms > 0 && <span><Bath size={15}/>{property.bathrooms}</span>}
          </span>
        </div>
      </div>
    </Link>
  </article>;
}
