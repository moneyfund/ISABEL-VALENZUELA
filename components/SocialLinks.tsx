import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { socialChannels } from "@/lib/social";
import type { SiteContent } from "@/lib/models";

function TikTokIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.7 2c.2 2.3 1.5 3.8 4.1 4v3.8c-1.6 0-3.1-.5-4.1-1.4v7.1c0 4-3 6.5-6.6 6.5-3.3 0-6.1-2.7-6.1-6.1 0-3.8 3.3-6.5 7.2-6.1v4c-1.7-.5-3.4.5-3.4 2.2 0 1.2 1 2.2 2.3 2.2 1.6 0 2.5-1.1 2.5-2.6V2h4.1Z"/></svg>;
}

export default function SocialLinks({ site, className = "", showLabels = false }: {
  site: SiteContent; className?: string; showLabels?: boolean;
}) {
  return <div className={`social-links ${className}`} aria-label="Redes sociales de Isabel Valenzuela">
    {socialChannels(site).map(channel => {
      const icon = channel.key === "facebook" ? <Facebook size={18} /> :
        channel.key === "instagram" ? <Instagram size={18} /> :
        channel.key === "tiktok" ? <TikTokIcon size={17} /> : <MessageCircle size={19} />;
      return channel.url
        ? <a href={channel.url} target="_blank" rel="noopener noreferrer" key={channel.key}
            aria-label={`Abrir ${channel.name} de Isabel Valenzuela`} title={channel.name}>
            {icon}{showLabels && <span>{channel.name}</span>}
          </a>
        : <span className="social-links__inactive" key={channel.key}
            title={`${channel.name} pendiente de configurar`} aria-label={`${channel.name} pendiente de configurar`}>
            {icon}{showLabels && <span>{channel.name}</span>}
          </span>;
    })}
  </div>;
}
