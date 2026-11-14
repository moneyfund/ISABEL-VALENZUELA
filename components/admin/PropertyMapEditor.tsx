"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Crosshair, MapPin, RotateCcw } from "lucide-react";
import PropertyLocationMap from "@/components/PropertyLocationMap";
import { validPropertyCoordinates, type PropertyCoordinates } from "@/lib/models";

export default function PropertyMapEditor({
  coordinates, onChange
}: {
  coordinates?: PropertyCoordinates | null;
  onChange: (value: PropertyCoordinates | null) => void;
}) {
  const [latitude, setLatitude] = useState(coordinates?.lat.toString() || "");
  const [longitude, setLongitude] = useState(coordinates?.lng.toString() || "");

  useEffect(() => {
    setLatitude(validPropertyCoordinates(coordinates) ? coordinates.lat.toString() : "");
    setLongitude(validPropertyCoordinates(coordinates) ? coordinates.lng.toString() : "");
  }, [coordinates?.lat, coordinates?.lng, coordinates]);

  const manualPoint = latitude.trim() && longitude.trim()
    ? { lat: Number(latitude), lng: Number(longitude) }
    : null;
  const manualValid = validPropertyCoordinates(manualPoint);

  function handleMapClick(point: PropertyCoordinates) {
    onChange(point);
    setLatitude(point.lat.toString());
    setLongitude(point.lng.toString());
  }

  function clearPoint() {
    onChange(null);
    setLatitude("");
    setLongitude("");
  }

  return <div className="admin-panel admin-map-section">
    <h3>Ubicación en el mapa</h3>
    <p className="admin-map-section__intro">Arrastrá el mapa hasta la zona del inmueble y hacé clic sobre el lugar exacto para colocar el marcador. Podés acercar o alejar con los controles del mapa.</p>
    <PropertyLocationMap coordinates={coordinates} editable onSelect={handleMapClick}/>
    {validPropertyCoordinates(coordinates) ? <div className="admin-map-section__selected">
      <CheckCircle2 size={18}/>
      <strong>Ubicación marcada</strong>
      <span>{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
      <button type="button" onClick={clearPoint}><RotateCcw size={14}/> Quitar marcador</button>
    </div> : <div className="admin-map-section__selected admin-map-section__selected--empty">
      <MapPin size={18}/> Aún no seleccionaste una ubicación. Podés guardar el anuncio sin marcador y agregarlo después.
    </div>}
    <div className="admin-map-section__coordinates">
      <label>Latitud
        <input type="number" min={-90} max={90} step="any" value={latitude}
          placeholder="Ej. 12.925000" onChange={e => setLatitude(e.target.value)} />
      </label>
      <label>Longitud
        <input type="number" min={-180} max={180} step="any" value={longitude}
          placeholder="Ej. -85.916000" onChange={e => setLongitude(e.target.value)} />
      </label>
    </div>
    <div className="admin-map-section__selected">
      <Crosshair size={18}/>
      <span>¿Tenés coordenadas desde otro mapa?</span>
      <button type="button" disabled={!manualValid} onClick={() => {
        if (manualValid && manualPoint) handleMapClick({
          lat: Number(manualPoint.lat.toFixed(6)),
          lng: Number(manualPoint.lng.toFixed(6))
        });
      }}>Usar coordenadas</button>
    </div>
    <p className="admin-map-section__hint">Los visitantes verán el mismo marcador en la ficha pública después de guardar y publicar la propiedad. Si no fijás un punto, no se mostrará un mapa con una ubicación inventada.</p>
  </div>;
}
