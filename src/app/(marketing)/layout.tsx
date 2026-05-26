import type { ReactNode } from "react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BackgroundLayers } from "@/components/marketing/animation/background-layers";
import { NewsletterPopup } from "@/components/marketing/newsletter-popup";
import { UtmCapture } from "@/components/marketing/utm-capture";

/** Layout institucional: atmosfera visual (grid + noise), header e footer. */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <BackgroundLayers />
      <Header />
      <main id="conteudo" className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
      <NewsletterPopup />
      <UtmCapture />
    </>
  );
}
