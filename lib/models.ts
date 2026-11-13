export type PropertyCategory = "Casa" | "Apartamento" | "Terreno" | "Finca" | "Comercial";
export type Operation = "Venta" | "Alquiler";

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  operation: Operation;
  city: string;
  location: string;
  price: number;
  area: number;
  landArea?: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  description: string;
  highlights: string[];
  featured: boolean;
  published: boolean;
  createdAt: number;
  demo?: boolean;
}

export interface SiteContent {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  introTitle: string;
  introDescription: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  serviceArea: string;
  whatsapp: string;
  email: string;
  instagram: string;
}

export const defaultSite: SiteContent = {
  eyebrow: "BIENES RAÍCES · NICARAGUA",
  heroTitle: "Espacios que inspiran. Decisiones que trascienden.",
  heroSubtitle: "Acompañamiento inmobiliario cercano, criterio profesional y una selección pensada para tu próxima etapa.",
  heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=85",
  introTitle: "Cada propiedad es el comienzo de una historia.",
  introDescription: "Explora espacios con potencial y encuentra asesoría personal durante cada etapa de tu decisión inmobiliaria.",
  aboutTitle: "Un servicio personal. Una visión de largo plazo.",
  aboutDescription: "Creo en relaciones basadas en confianza, claridad y atención a los detalles. Mi objetivo es ayudarte a identificar oportunidades inmobiliarias alineadas con lo que realmente buscas.",
  aboutImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1300&q=85",
  serviceArea: "Nicaragua",
  whatsapp: "",
  email: "",
  instagram: ""
};
