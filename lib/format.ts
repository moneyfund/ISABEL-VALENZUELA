export const money = (amount: number) =>
  amount > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount) : "Consultar precio";

export const digits = (value: string) => value.replace(/\D/g, "");

export function contactLink(whatsapp: string, email: string, title: string): string | null {
  const phone = digits(whatsapp);
  const message = encodeURIComponent(`Hola Isabel, me interesa conocer más sobre: ${title}.`);
  if (phone) return `https://wa.me/${phone}?text=${message}`;
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return `mailto:${email}?subject=${encodeURIComponent("Consulta inmobiliaria")}&body=${message}`;
  }
  return null;
}
export const validImage = (url: string) => /^https:\/\//i.test(url) || url.startsWith("/");

export function cleanPropertyId(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54);
}
