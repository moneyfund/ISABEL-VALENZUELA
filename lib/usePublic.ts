"use client";
import { useEffect, useState } from "react";
import { subscribeProperties, subscribeSite } from "./repository";
import { defaultSite, type Property, type SiteContent } from "./models";

export function useSiteContent() {
  const [site, setSite] = useState<SiteContent>(defaultSite);
  const [error, setError] = useState("");
  useEffect(() => subscribeSite(setSite, () => setError("No fue posible actualizar el contenido del sitio.")), []);
  return { site, error };
}

export function usePublicProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    return subscribeProperties(items => { setProperties(items); setLoading(false); },
      () => { setError("No fue posible cargar el catálogo en tiempo real."); setLoading(false); });
  }, []);
  return { properties, error, loading };
}
