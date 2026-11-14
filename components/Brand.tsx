import Link from "next/link";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={compact ? "brand brand--compact" : "brand"} aria-label="Isabel Valenzuela, ir al inicio">
      <img src="/logo-isabel.svg" alt="Isabel Valenzuela · Bienes Raíces" width="690" height="178" />
    </Link>
  );
}
