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
  aboutImage: "/isabel-valenzuela.webp",
  serviceArea: "Nicaragua",
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: ""
};
