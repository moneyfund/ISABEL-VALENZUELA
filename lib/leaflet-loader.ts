/**
 * Leaflet 1.9.4 loaded from the official stable CDN build. This avoids
 * changing the app's dependency lockfile for a single, lazy-loaded map.
 */
export type MapPoint = [number, number];
export interface LeafletMap {
  setView(point: MapPoint, zoom: number): LeafletMap;
  getZoom(): number;
  on(event: "click", handler: (event: { latlng: { lat: number; lng: number } }) => void): LeafletMap;
  invalidateSize(): LeafletMap;
  remove(): void;
}
export interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  setLatLng(point: MapPoint): LeafletMarker;
  remove(): void;
}
interface LeafletIcon {}
export interface LeafletGlobal {
  map(target: HTMLElement, options?: { scrollWheelZoom?: boolean }): LeafletMap;
  marker(point: MapPoint, options?: { icon?: LeafletIcon }): LeafletMarker;
  icon(options: {
    iconUrl: string; iconRetinaUrl: string; shadowUrl: string;
    iconSize: [number, number]; iconAnchor: [number, number];
    popupAnchor: [number, number]; shadowSize: [number, number];
  }): LeafletIcon;
  tileLayer(url: string, options: { maxZoom: number; attribution: string }): { addTo(map: LeafletMap): unknown };
}

declare global {
  interface Window { L?: LeafletGlobal }
}

let loader: Promise<LeafletGlobal> | null = null;

export function loadLeaflet(): Promise<LeafletGlobal> {
  if (typeof window === "undefined") return Promise.reject(new Error("Map requires a browser."));
  if (window.L) return Promise.resolve(window.L);
  if (loader) return loader;

  loader = new Promise<LeafletGlobal>((resolve, reject) => {
    const base = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/";
    if (!document.getElementById("isabel-leaflet-styles")) {
      const link = document.createElement("link");
      link.id = "isabel-leaflet-styles";
      link.rel = "stylesheet";
      link.href = base + "leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = base + "leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else { loader = null; reject(new Error("Leaflet failed to initialize.")); }
    };
    script.onerror = () => {
      loader = null;
      reject(new Error("Map assets could not be loaded."));
    };
    document.head.appendChild(script);
  });
  return loader;
}

export function standardMapMarker(L: LeafletGlobal) {
  const img = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/";
  return L.icon({
    iconUrl: img + "marker-icon.png",
    iconRetinaUrl: img + "marker-icon-2x.png",
    shadowUrl: img + "marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}
