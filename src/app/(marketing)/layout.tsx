import type { ReactNode } from "react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BackgroundLayers } from "@/components/marketing/animation/background-layers";

/**
 * Layout do site institucional (route group `(marketing)`).
 *
 * Versão minimalista: só atmosfera visual (grid + noise) + header/footer.
 * SmoothScroll, CustomCursor, ScrollProgress, PageLoader e
 * RevealOnScroll estão temporariamente desativados — eles serão
 * reativados individualmente após estabilizar o layout.
 */
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
    </>
  );
}
