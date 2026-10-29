import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Goldoni Contadores | Contabilidade e Direito em Junqueirópolis/SP",
    template: "%s | Goldoni Contadores",
  },
  description:
    "Escritório de contabilidade em Junqueirópolis/SP com mais de 50 anos de tradição e mais de 500 empresas assessoradas. Contabilidade, fiscal, departamento pessoal, abertura de empresas e assessoria jurídica.",
  keywords: [
    "contabilidade em Junqueirópolis",
    "contador Junqueirópolis",
    "abrir empresa Junqueirópolis",
    "escritório de contabilidade Nova Alta Paulista",
    "planejamento tributário",
    "Goldoni Contadores",
  ],
  applicationName: "Goldoni Contadores",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Goldoni Contadores",
    images: [{ url: "/images/hero-escritorio.jpg", width: 1672, height: 941, alt: "Goldoni Contadores" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b2a4e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
