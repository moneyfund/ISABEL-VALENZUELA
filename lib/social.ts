import { digits } from "./format";
import type { SiteContent } from "./models";

type Network = "facebook" | "instagram" | "tiktok";
const hosts: Record<Network, string[]> = {
  facebook: ["facebook.com", "fb.com", "fb.me", "m.facebook.com", "www.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"]
};

export function safeSocialUrl(network: Network, input: string | undefined): string | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !!url.username || !!url.password) return null;
    const hostname = url.hostname.toLowerCase();
    const base = network === "facebook" ? "facebook.com" : network === "tiktok" ? "tiktok.com" : "instagram.com";
    if (!hosts[network].includes(hostname) && hostname !== base) return null;
    return url.toString();
  } catch { return null; }
}

export function whatsappUrl(input: string | undefined, message = "Hola Isabel, me gustaría recibir asesoría inmobiliaria."): string | null {
  const phone = digits(input ?? "");
  if (phone.length < 8 || phone.length > 15) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function contactEmail(value: string | undefined): string | null {
  const email = (value ?? "").trim();
  const re = new RegExp("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
  return re.test(email) ? email : null;
}

export function socialChannels(site: SiteContent) {
  return [
    { name: "Facebook", key: "facebook", url: safeSocialUrl("facebook", site.facebook) },
    { name: "Instagram", key: "instagram", url: safeSocialUrl("instagram", site.instagram) },
    { name: "TikTok", key: "tiktok", url: safeSocialUrl("tiktok", site.tiktok) },
    { name: "WhatsApp", key: "whatsapp", url: whatsappUrl(site.whatsapp) }
  ] as const;
}
