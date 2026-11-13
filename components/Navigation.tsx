"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "./Brand";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled || open ? "nav--solid" : ""}`}>
      <div className="container nav__inner">
        <Brand />
        <nav className={`nav__links ${open ? "nav__links--open" : ""}`} aria-label="Navegación principal">
          <Link onClick={() => setOpen(false)} href="/#inicio">Inicio</Link>
          <Link onClick={() => setOpen(false)} href="/#propiedades">Propiedades</Link>
          <Link onClick={() => setOpen(false)} href="/#nosotros">Sobre Isabel</Link>
          <Link onClick={() => setOpen(false)} href="/#contacto" className="nav__contact">Hablemos <ArrowUpRight size={15} /></Link>
        </nav>
        <button aria-label={open ? "Cerrar menú" : "Abrir menú"} className="nav__toggle" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
    </header>
  );
}
