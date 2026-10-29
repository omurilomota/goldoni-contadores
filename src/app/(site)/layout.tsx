import type { ReactNode } from "react";
import { DemoBanner, SiteFooter, SiteHeader, WhatsAppFloat } from "@/components/site-chrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
