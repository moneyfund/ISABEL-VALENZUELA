export type PropertyCategory = "Casa" | "Apartamento" | "Terreno" | "Finca" | "Comercial";
export type Operation = "Venta" | "Alquiler";

export type PropertyAreaUnit = "m2" | "mz";

export interface PropertyDetails {
  parkingSpaces?: number;
  levels?: number;
  floorNumber?: number;
  furnishing?: string;
  topography?: string;
  accessType?: string;
  landUse?: string;
  farmUse?: string;
  commercialType?: string;
  frontMeters?: number;
  depthMeters?: number;
  services?: string[];
  features?: string[];
}


export interface PropertyCoordinates {
  lat: number;
  lng: number;
}

export function validPropertyCoordinates(value: unknown): value is PropertyCoordinates {
  if (!value || typeof value !== "object") return false;
  const coords = value as Partial<PropertyCoordinates>;
  return typeof coords.lat === "number"
    && Number.isFinite(coords.lat) && coords.lat >= -90 && coords.lat <= 90
    && typeof coords.lng === "number"
    && Number.isFinite(coords.lng) && coords.lng >= -180 && coords.lng <= 180;
}

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  operation: Operation;
  city: string;
  location: string;
  coordinates?: PropertyCoordinates | null;
  price: number;
  area: number;
  areaUnit?: PropertyAreaUnit;
  landArea?: number;
  details?: PropertyDetails;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  description: string;
  highlights: string[];
  featured: boolean;
  published: boolean;
  createdAt: number;
}

export interface SiteContent {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImage2: string;
  heroImage3: string;
  introTitle: string;
  introDescription: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  serviceArea: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export const defaultSite: SiteContent = {
  eyebrow: "BIENES RAÍCES · NICARAGUA",
  heroTitle: "Espacios que inspiran. Decisiones que trascienden.",
  heroSubtitle: "Acompañamiento inmobiliario cercano, criterio profesional y una selección pensada para tu próxima etapa.",
  heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85",
  heroImage2: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1900&q=85",
  heroImage3: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1900&q=85",
  introTitle: "Cada propiedad es el comienzo de una historia.",
  introDescription: "Explora espacios con potencial y encuentra asesoría personal durante cada etapa de tu decisión inmobiliaria.",
  aboutTitle: "Soy Isabel Valenzuela. Tu siguiente paso comienza con confianza.",
  aboutDescription: "Te acompaño a explorar oportunidades inmobiliarias en Nicaragua con una atención cercana, transparente y enfocada en tus objetivos. Cada decisión merece tiempo, información clara y un trato verdaderamente personal.",
  aboutImage: "https://d2ol7oe51mr4n9.cloudfront.net/user_3KniZP3dkw5KyzASdx6oDnrJPeH/232c4026-f827-4bf9-9516-e730cd0b2727.jpg",
  serviceArea: "Nicaragua",
  whatsapp: "50557251888",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: ""
};

/**
 * Backward compatible defaults for documents saved before official contact was set.
 * Empty or absent WhatsApp from an older Firestore record uses the current official number.
 */
export function normalizeSiteContent(source: Partial<SiteContent> | null | undefined): SiteContent {
  const site = { ...defaultSite, ...(source || {}) };
  return {
    ...site,
    // Upgrade the low-resolution portrait reference in existing site/public records,
    // without changing any custom photograph Isabel may have selected.
    aboutImage: !site.aboutImage || site.aboutImage === "/isabel-valenzuela.webp"
      ? defaultSite.aboutImage
      : site.aboutImage,
    whatsapp: typeof site.whatsapp === "string" && site.whatsapp.trim()
      ? site.whatsapp.trim()
      : defaultSite.whatsapp
  };
}
