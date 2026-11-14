import type { Metadata } from "next";
import "../guia-de-compra/guia.css";
import "./guides.css";

export const metadata:Metadata={
  title:"Guías inmobiliarias | Isabel Valenzuela",
  description:"Guías gratuitas en Nicaragua para comprar, vender, buscar un local en renta o alquilar un local comercial. Recibí orientación según tu situación."
};

export default function GuidesLayout({children}:{children:React.ReactNode}){return children;}
