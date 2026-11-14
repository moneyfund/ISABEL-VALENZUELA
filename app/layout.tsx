import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
import "./property-map.css";

export const metadata: Metadata = {
  title: { default: "Isabel Valenzuela | Bienes Raíces", template: "%s | Isabel Valenzuela" },
  description: "Asesoría inmobiliaria personalizada en Nicaragua. Explora casas, terrenos, fincas y espacios para tu próxima etapa.",
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
