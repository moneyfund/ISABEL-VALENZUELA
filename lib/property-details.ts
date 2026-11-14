import type { Property, PropertyCategory, PropertyDetails } from "./models";

export type AreaUnit = "m2" | "mz";

export const propertyCategoryInfo: Record<PropertyCategory, {
  title: string;
  areaLabel: string;
  help: string;
  features: readonly string[];
}> = {
  Casa: {
    title: "Características de la casa",
    areaLabel: "Área construida",
    help: "Distribución, espacios exteriores y equipamiento de la vivienda.",
    features: ["Jardín", "Patio", "Terraza", "Área de lavado", "Cocina integral", "Piscina", "Bodega", "Portón eléctrico", "Cuarto de servicio"]
  },
  Apartamento: {
    title: "Características del apartamento",
    areaLabel: "Área del apartamento",
    help: "Distribución, nivel, estacionamientos y áreas comunes.",
    features: ["Balcón", "Ascensor", "Seguridad", "Área social", "Gimnasio", "Piscina", "Área de lavado", "Bodega", "Planta eléctrica"]
  },
  Terreno: {
    title: "Características del terreno",
    areaLabel: "Superficie del terreno",
    help: "Topografía, medidas, acceso, servicios y uso previsto.",
    features: ["Terreno esquinero", "Cercado", "Vista panorámica", "Acceso vehicular", "Linderos delimitados", "Cerca de vía principal"]
  },
  Finca: {
    title: "Características de la finca",
    areaLabel: "Extensión de la finca",
    help: "Extensión, actividad, caminos, disponibilidad de agua y mejoras.",
    features: ["Casa de finca", "Corral", "Cercos perimetrales", "Pastos", "Cultivos", "Río o quebrada", "Pozo", "Bodega", "Infraestructura productiva"]
  },
  Comercial: {
    title: "Características del inmueble comercial",
    areaLabel: "Área del local o inmueble",
    help: "Tipo de espacio, distribución, acceso y facilidades comerciales.",
    features: ["Vitrina", "Recepción", "Área de carga", "Bodega", "Aire acondicionado", "Seguridad", "Salida de emergencia", "Acceso independiente", "Fachada comercial"]
  }
};

export const serviceOptions = [
  "Agua potable", "Energía eléctrica", "Internet", "Alcantarillado", "Pozo propio", "Acceso vehicular"
] as const;

export const topographyOptions = ["Plana", "Semiplana", "Inclinada", "Mixta"] as const;
export const accessOptions = ["Pavimentado", "Adoquinado", "Macadán", "Camino de tierra", "Otro"] as const;
export const landUseOptions = ["Residencial", "Comercial", "Agrícola", "Mixto", "Otro"] as const;
export const farmUseOptions = ["Ganadera", "Agrícola", "Mixta", "Recreativa", "Otro"] as const;
export const commercialTypes = ["Local comercial", "Oficina", "Bodega", "Edificio", "Otro"] as const;
export const furnishingOptions = ["Sin amueblar", "Semi amueblada", "Amueblada"] as const;

export const hasBedrooms = (category: PropertyCategory) => category === "Casa" || category === "Apartamento";
export const hasBathrooms = (category: PropertyCategory) => hasBedrooms(category) || category === "Comercial";
export const hasLandArea = (category: PropertyCategory) => category === "Casa";
export const hasAreaUnitSelector = (category: PropertyCategory) => category === "Terreno" || category === "Finca";

const allowedDetails: Record<PropertyCategory, readonly (keyof PropertyDetails)[]> = {
  Casa: ["parkingSpaces", "levels", "furnishing", "features"],
  Apartamento: ["parkingSpaces", "floorNumber", "furnishing", "features"],
  Terreno: ["topography", "accessType", "landUse", "frontMeters", "depthMeters", "services", "features"],
  Finca: ["topography", "accessType", "farmUse", "services", "features"],
  Comercial: ["parkingSpaces", "levels", "commercialType", "features"]
};

export function cleanedPropertyDetails(category: PropertyCategory, value?: PropertyDetails): PropertyDetails {
  const clean: PropertyDetails = {};
  if (!value) return clean;
  for (const key of allowedDetails[category]) {
    const input = value[key];
    if (Array.isArray(input)) {
      const allowed = key === "services" ? serviceOptions : propertyCategoryInfo[category].features;
      const filtered = input.filter(item => typeof item === "string" && allowed.includes(item as never));
      if (filtered.length) Object.assign(clean, { [key]: [...new Set(filtered)] });
    } else if (typeof input === "number" && Number.isFinite(input) && input > 0 && input <= 1_000_000) {
      Object.assign(clean, { [key]: input });
    } else if (typeof input === "string" && input.trim()) {
      Object.assign(clean, { [key]: input.trim() });
    }
  }
  return clean;
}

export function propertyAreaLabel(property: Pick<Property, "area" | "areaUnit">): string {
  const unit = property.areaUnit === "mz" ? "mz" : "m²";
  return `${new Intl.NumberFormat("es-NI", { maximumFractionDigits: 2 }).format(property.area)} ${unit}`;
}

export function categoryDetailsForDisplay(property: Property): { label: string; value: string }[] {
  const data = cleanedPropertyDetails(property.category, property.details);
  const details: { label: string; value: string }[] = [];
  const addNumber = (key: keyof PropertyDetails, label: string, unit = "") => {
    const val = data[key];
    if (typeof val === "number" && val > 0) details.push({ label, value: String(val) + unit });
  };
  const addString = (key: keyof PropertyDetails, label: string) => {
    const val = data[key];
    if (typeof val === "string" && val) details.push({ label, value: val });
  };
  if (property.category === "Casa" || property.category === "Apartamento" || property.category === "Comercial") {
    addNumber("parkingSpaces", "Estacionamientos");
  }
  if (property.category === "Casa" || property.category === "Comercial") addNumber("levels", "Niveles");
  if (property.category === "Apartamento") addNumber("floorNumber", "Piso");
  if (hasBedrooms(property.category)) addString("furnishing", "Amueblado");
  if (property.category === "Terreno" || property.category === "Finca") {
    addString("topography", "Topografía");
    addString("accessType", "Tipo de acceso");
  }
  if (property.category === "Terreno") {
    addString("landUse", "Uso previsto");
    addNumber("frontMeters", "Frente", " m");
    addNumber("depthMeters", "Fondo", " m");
  }
  if (property.category === "Finca") addString("farmUse", "Actividad principal");
  if (property.category === "Comercial") addString("commercialType", "Tipo de espacio");
  return details;
}
