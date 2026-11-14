"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RotateCcw, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { usePublicProperties, useSiteContent } from "@/lib/usePublic";

export default function PropertiesPage() {
  const { site } = useSiteContent();
  const { properties, loading, error } = usePublicProperties();
  const [keyword,setKeyword] = useState("");
  const [operation,setOperation] = useState("Todas");
  const [category,setCategory] = useState("Todas");
  const [show,setShow] = useState(9);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setKeyword(q.get("q") || "");
    setOperation(["Venta","Alquiler"].includes(q.get("operacion") || "") ? q.get("operacion")! : "Todas");
    setCategory(["Casa","Apartamento","Terreno","Finca","Comercial"].includes(q.get("tipo") || "") ? q.get("tipo")! : "Todas");
  }, []);

  const found = useMemo(() => properties.filter(p => {
    const phrase = `${p.title} ${p.city} ${p.location} ${p.description}`.toLocaleLowerCase("es");
    return (operation === "Todas" || p.operation === operation)
      && (category === "Todas" || p.category === category)
      && (!keyword.trim() || phrase.includes(keyword.trim().toLocaleLowerCase("es")));
  }), [properties,keyword,operation,category]);

  function clear() {setKeyword("");setOperation("Todas");setCategory("Todas");setShow(9);}

  return <main className="subpage">
    <Navigation/>
    <section className="subpage__hero subpage__hero--catalog"><div className="container subpage__hero-inner">
      <p className="eyebrow eyebrow--gold">CATÁLOGO INMOBILIARIO / NICARAGUA</p><h1>Encuentra tu <em>próximo espacio.</em></h1>
      <p>Casas, terrenos, fincas y otros espacios para cada etapa de tu proyecto.</p>
      <span className="subpage__hero-index">COLECCIÓN 01 — {new Date().getFullYear()}</span>
    </div></section>
    <section className="catalog section-space"><div className="container">
      <div className="catalog__filters">
        <label><span>BUSCAR POR UBICACIÓN O REFERENCIA</span><div className="catalog__search"><Search size={19}/><input value={keyword} onChange={e=>{setKeyword(e.target.value);setShow(9);}} placeholder="Ciudad, sector, nombre..." aria-label="Buscar inmuebles"/></div></label>
        <label><span>OPERACIÓN</span><select value={operation} onChange={e=>{setOperation(e.target.value);setShow(9);}}><option>Todas</option><option>Venta</option><option>Alquiler</option></select></label>
        <label><span>TIPO DE PROPIEDAD</span><select value={category} onChange={e=>{setCategory(e.target.value);setShow(9);}}><option>Todas</option><option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Finca</option><option>Comercial</option></select></label>
        <button className="catalog__clear" onClick={clear}><RotateCcw size={16}/> Limpiar</button>
      </div>
      <div className="catalog__summary"><div><p className="eyebrow eyebrow--dark"><MapPin size={13}/> SELECCIÓN INMOBILIARIA</p><h2>Explora las propiedades</h2></div><span>{loading ? "Buscando..." : `${found.length} ${found.length === 1 ? "propiedad" : "propiedades"}`}</span></div>
      
      {error && <p className="status-error" role="alert">{error}</p>}
      <div className="properties-grid">{found.slice(0,show).map((p,i)=><PropertyCard key={p.id} property={p} index={i}/>)}</div>
      {!loading && !found.length && <div className="empty-results"><Search size={32}/><h3>No hay inmuebles con esos filtros.</h3><p>Prueba otras palabras o consulta directamente con Isabel.</p><button onClick={clear} className="btn btn--outline">Mostrar todos <ArrowRight size={16}/></button></div>}
      {found.length>show && <div className="listings__more"><button onClick={()=>setShow(x=>x+9)} className="btn btn--outline">Cargar más propiedades <ArrowRight size={17}/></button></div>}
      <div className="catalog__bottom"><p>¿No encuentras lo que buscas?</p><Link href="/contacto" className="text-link">Solicita una asesoría personalizada <ArrowRight size={17}/></Link></div>
    </div></section>
    <Footer site={site}/>
  </main>;
}
