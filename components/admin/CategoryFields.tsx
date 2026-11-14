"use client";

import type { Property, PropertyDetails } from "@/lib/models";
import {
  accessOptions, commercialTypes, farmUseOptions, furnishingOptions,
  hasBathrooms, hasBedrooms, hasLandArea, landUseOptions,
  propertyCategoryInfo, serviceOptions, topographyOptions
} from "@/lib/property-details";

type NumericField = "parkingSpaces" | "levels" | "floorNumber" | "frontMeters" | "depthMeters";
type SelectField = "furnishing" | "topography" | "accessType" | "landUse" | "farmUse" | "commercialType";

export default function CategoryFields({
  property, onUpdate
}: {
  property: Property;
  onUpdate: (patch: Partial<Property>) => void;
}) {
  const details = property.details || {};
  const spec = propertyCategoryInfo[property.category];

  const updateDetails = (patch: Partial<PropertyDetails>) =>
    onUpdate({ details: { ...details, ...patch } });

  const updateList = (key: "features" | "services", item: string, selected: boolean) => {
    const current = details[key] || [];
    updateDetails({ [key]: selected
      ? Array.from(new Set([...current, item]))
      : current.filter(value => value !== item)
    });
  };

  function numberField(key: NumericField, label: string, opts?: { min?: number; step?: string; hint?: string }) {
    return <label key={key}>
      {label}
      <input type="number" min={opts?.min ?? 0} step={opts?.step ?? "1"} placeholder="Opcional"
        value={details[key] ?? ""}
        onChange={event => updateDetails({ [key]: event.target.value === "" ? undefined : Number(event.target.value) })}/>
      {opts?.hint && <small className="admin-field-hint">{opts.hint}</small>}
    </label>;
  }

  function selectField(key: SelectField, label: string, options: readonly string[]) {
    return <label key={key}>
      {label}
      <select value={details[key] || ""} onChange={event => updateDetails({ [key]: event.target.value || undefined })}>
        <option value="">Seleccionar (opcional)</option>
        {options.map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>;
  }

  return <div className="admin-panel admin-category-panel" key={property.category}>
    <div className="admin-category-panel__header">
      <div><p>DATOS ESPECÍFICOS</p><h3>{spec.title}</h3><span>{spec.help}</span></div>
      <span className="admin-category-panel__tag">{property.category}</span>
    </div>
    <div className="form-grid admin-category-panel__fields">
      {hasBedrooms(property.category) && <label>
        Habitaciones
        <input type="number" min={0} step="1" value={property.bedrooms || ""}
          placeholder="Ej. 3"
          onChange={e => onUpdate({ bedrooms: e.target.value === "" ? 0 : Number(e.target.value) })} />
      </label>}
      {hasBathrooms(property.category) && <label>
        Baños
        <input type="number" min={0} step="1" value={property.bathrooms || ""}
          placeholder="Ej. 2"
          onChange={e => onUpdate({ bathrooms: e.target.value === "" ? 0 : Number(e.target.value) })} />
      </label>}
      {hasLandArea(property.category) && <label>
        Área del terreno (m², opcional)
        <input type="number" min={0} step="any" value={property.landArea || ""}
          placeholder="Ej. 320"
          onChange={e => onUpdate({ landArea: e.target.value === "" ? undefined : Number(e.target.value) })} />
      </label>}
      {(["Casa", "Apartamento", "Comercial"] as const).includes(property.category as "Casa" | "Apartamento" | "Comercial") &&
        numberField("parkingSpaces", "Estacionamientos")}
      {(["Casa", "Comercial"] as const).includes(property.category as "Casa" | "Comercial") &&
        numberField("levels", "Niveles")}
      {property.category === "Apartamento" && numberField("floorNumber", "Piso del apartamento", { hint: "Número de piso del edificio" })}
      {(property.category === "Casa" || property.category === "Apartamento") &&
        selectField("furnishing", "Estado del mobiliario", furnishingOptions)}
      {(property.category === "Terreno" || property.category === "Finca") && <>
        {selectField("topography", "Topografía", topographyOptions)}
        {selectField("accessType", "Tipo de acceso", accessOptions)}
      </>}
      {property.category === "Terreno" && <>
        {numberField("frontMeters", "Frente (m)", { step: "any" })}
        {numberField("depthMeters", "Fondo (m)", { step: "any" })}
        {selectField("landUse", "Uso previsto del terreno", landUseOptions)}
      </>}
      {property.category === "Finca" && selectField("farmUse", "Actividad principal", farmUseOptions)}
      {property.category === "Comercial" && selectField("commercialType", "Tipo de espacio comercial", commercialTypes)}
    </div>

    {(property.category === "Terreno" || property.category === "Finca") && <fieldset className="admin-category-panel__checklist">
      <legend>Servicios e infraestructura disponibles</legend>
      <div className="admin-category-panel__options">
        {serviceOptions.map(service => <label key={service}>
          <input type="checkbox" checked={(details.services || []).includes(service)}
            onChange={e => updateList("services", service, e.target.checked)}/>
          {service}
        </label>)}
      </div>
    </fieldset>}

    <fieldset className="admin-category-panel__checklist">
      <legend>Características de {property.category.toLocaleLowerCase("es")}</legend>
      <div className="admin-category-panel__options">
        {spec.features.map(feature => <label key={feature}>
          <input type="checkbox" checked={(details.features || []).includes(feature)}
            onChange={e => updateList("features", feature, e.target.checked)}/>
          {feature}
        </label>)}
      </div>
    </fieldset>
    <p className="admin-category-panel__footnote">
      Solo se mostrarán y guardarán los datos correspondientes a {property.category.toLocaleLowerCase("es")}.
      Podés agregar características adicionales en la descripción o en atributos destacados.
    </p>
  </div>;
}
