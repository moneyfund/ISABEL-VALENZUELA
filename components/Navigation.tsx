"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "./Brand";

const pages = [
  { title: "Inicio", href: "/" },
  { title: "Propiedades", href: "/propiedades" },
  { title: "Guías", href: "/guias" },
  { title: "Servicios", href: "/servicios" },
  { title: "Sobre Isabel", href: "/sobre-isabel" },
  { title: "Contacto", href: "/contacto" }
];

export default function Navigation() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return <header className={`nav ${!onHome || scrolled || open ? "nav--solid" : ""}`}>
    <div className="container nav__inner">
      <Brand />
      <nav className={`nav__links ${open ? "nav__links--open" : ""}`} aria-label="Navegación principal">
        {pages.map(page => <Link key={page.href} href={page.href}
          onClick={() => setOpen(false)}
          className={`${pathname === page.href || (page.href === "/propiedades" && pathname.startsWith("/propiedades/")) || (page.href === "/guias" && (pathname.startsWith("/guias/") || pathname === "/guia-de-compra")) ? "nav__active" : ""} ${page.href === "/contacto" ? "nav__contact" : ""}`}>
          {page.title}{page.href === "/contacto" && <ArrowUpRight size={15} />}
        </Link>)}
      </nav>
      <button type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}
        className="nav__toggle" onClick={() => setOpen(!open)}>{open ? <X size={26} /> : <Menu size={26} />}</button>
    </div>
  </header>;
}
