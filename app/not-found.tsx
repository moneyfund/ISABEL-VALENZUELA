import Link from "next/link";
export default function NotFound() {
  return <main className="not-found"><div><p className="eyebrow eyebrow--gold">404 / PÁGINA NO ENCONTRADA</p><h1>Esta dirección ya no está aquí.</h1><p>Regresa al inicio y descubre más espacios.</p><Link className="btn btn--gold" href="/">Volver al inicio</Link></div></main>;
}
