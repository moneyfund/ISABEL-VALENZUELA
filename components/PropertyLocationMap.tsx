"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyCoordinates } from "@/lib/models";
import { validPropertyCoordinates } from "@/lib/models";
import {
  loadLeaflet, standardMapMarker,
  type LeafletGlobal, type LeafletMap, type LeafletMarker
} from "@/lib/leaflet-loader";

type Props = {
  coordinates?: PropertyCoordinates | null;
  editable?: boolean;
  onSelect?: (value: PropertyCoordinates) => void;
};

const defaultCenter: [number, number] = [12.925, -85.916];

export default function PropertyLocationMap({ coordinates, editable = false, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const apiRef = useRef<LeafletGlobal | null>(null);
  const selectRef = useRef(onSelect);
  const editableRef = useRef(editable);
  const coordsRef = useRef(coordinates);
  const [error, setError] = useState(false);

  useEffect(() => {
    selectRef.current = onSelect;
    editableRef.current = editable;
    coordsRef.current = coordinates;
  }, [onSelect, editable, coordinates]);

  useEffect(() => {
    let mounted = true;
    loadLeaflet().then(L => {
      if (!mounted || !containerRef.current || mapRef.current) return;
      apiRef.current = L;
      const start = validPropertyCoordinates(coordsRef.current)
        ? coordsRef.current : null;
      const center: [number, number] = start
        ? [start.lat, start.lng] : defaultCenter;
      const map = L.map(containerRef.current, { scrollWheelZoom: false })
        .setView(center, start ? 15 : 10);
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
      }).addTo(map);

      if (start) markerRef.current = L.marker(center, { icon: standardMapMarker(L) }).addTo(map);
      if (editableRef.current) {
        map.on("click", event => {
          if (!editableRef.current || !selectRef.current) return;
          const point = {
            lat: Number(event.latlng.lat.toFixed(6)),
            lng: Number(event.latlng.lng.toFixed(6))
          };
          if (!validPropertyCoordinates(point)) return;
          selectRef.current(point);
        });
      }
      requestAnimationFrame(() => { if (mounted && mapRef.current === map) map.invalidateSize(); });
    }).catch(() => { if (mounted) setError(true); });

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = apiRef.current;
    if (!map || !L) return;
    if (!validPropertyCoordinates(coordinates)) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const point: [number, number] = [coordinates.lat, coordinates.lng];
    if (markerRef.current) markerRef.current.setLatLng(point);
    else markerRef.current = L.marker(point, { icon: standardMapMarker(L) }).addTo(map);
    map.setView(point, Math.max(map.getZoom(), 15));
  }, [coordinates?.lat, coordinates?.lng, coordinates]);

  return <div className={editable ? "property-location-map property-location-map--editable" : "property-location-map property-location-map--public"}>
    <div ref={containerRef} className="property-location-map__canvas"
      role={editable ? "application" : "img"}
      aria-label={editable ? "Mapa interactivo para seleccionar la ubicación de la propiedad" : "Mapa de ubicación de la propiedad"}/>
    {error && <p className="property-location-map__error">
      No fue posible cargar el mapa interactivo. {editable ? "Podés escribir las coordenadas en los campos de abajo." : "Intentá abrir la ubicación en OpenStreetMap."}
    </p>}
  </div>;
}
