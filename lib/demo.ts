import type { Property } from "./models";

export const demoProperties: Property[] = [
  {
    id: "demo-villa-contemporanea", title: "Residencia contemporánea con jardín",
    category: "Casa", operation: "Venta", city: "Managua", location: "Managua, Nicaragua",
    price: 265000, area: 240, landArea: 520, bedrooms: 4, bathrooms: 3,
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"],
    description: "Ficha ficticia creada para mostrar el diseño del catálogo. No corresponde a una propiedad actualmente ofrecida.",
    highlights: ["Jardín", "Terraza", "Estacionamiento"], featured: true, published: true, createdAt: 1762800000, demo: true
  },
  {
    id: "demo-casa-luminosa", title: "Casa de arquitectura luminosa",
    category: "Casa", operation: "Venta", city: "Matagalpa", location: "Matagalpa, Nicaragua",
    price: 178000, area: 185, landArea: 310, bedrooms: 3, bathrooms: 2,
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=85"],
    description: "Anuncio ilustrativo de demostración. Sus características y precio son ficticios.",
    highlights: ["Diseño contemporáneo", "Patio privado"], featured: true, published: true, createdAt: 1762799000, demo: true
  },
  {
    id: "demo-terreno-vistas", title: "Terreno de amplias posibilidades",
    category: "Terreno", operation: "Venta", city: "San Ramón", location: "San Ramón, Matagalpa",
    price: 62000, area: 1800, bedrooms: 0, bathrooms: 0,
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85"],
    description: "Publicación ficticia de ejemplo utilizada únicamente para la presentación visual de la plataforma.",
    highlights: ["Entorno natural", "Terreno amplio"], featured: false, published: true, createdAt: 1762798000, demo: true
  },
  {
    id: "demo-villa-costa", title: "Villa moderna cerca de la costa",
    category: "Casa", operation: "Venta", city: "San Juan del Sur", location: "San Juan del Sur, Rivas",
    price: 345000, area: 290, landArea: 640, bedrooms: 4, bathrooms: 4,
    images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85"],
    description: "Propiedad de demostración, no disponible para compra. Los datos son exclusivamente ilustrativos.",
    highlights: ["Piscina", "Terraza", "Vista abierta"], featured: true, published: true, createdAt: 1762797000, demo: true
  },
  {
    id: "demo-apartamento", title: "Apartamento urbano de líneas puras",
    category: "Apartamento", operation: "Alquiler", city: "Managua", location: "Managua, Nicaragua",
    price: 1150, area: 110, bedrooms: 2, bathrooms: 2,
    images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85"],
    description: "Anuncio ficticio con fines de prueba del diseño del catálogo.",
    highlights: ["Diseño interior", "Seguridad"], featured: false, published: true, createdAt: 1762796000, demo: true
  },
  {
    id: "demo-finca", title: "Refugio campestre entre montañas",
    category: "Finca", operation: "Venta", city: "Matagalpa", location: "Matagalpa, Nicaragua",
    price: 225000, area: 25000, bedrooms: 2, bathrooms: 2,
    images: ["https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=85"],
    description: "Esta ficha es solo una demostración y no representa una oferta vigente.",
    highlights: ["Entorno de montaña", "Naturaleza"], featured: false, published: true, createdAt: 1762795000, demo: true
  }
];
