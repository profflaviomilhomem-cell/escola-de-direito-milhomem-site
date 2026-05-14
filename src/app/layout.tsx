import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Geist } from "next/font/google";
import localFont from "next/font/local";
import { GoogleTagManager } from "@next/third-parties/google";
import { Toaster } from "sonner";

import { AnalyticsProviders } from "@/components/shared/analytics-providers";
import { WebVitalsReporter } from "@/components/shared/web-vitals-reporter";
import { siteConfig } from "@/config/site";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/**
 * Fontes via next/font — identidade Flávio Milhomem.
 *
 * Display: League Spartan Bold (geométrica, OFL) — h1/h2/h3 e marca.
 * Body: Hiragino Maru Gothic ProN W4 (humanística arredondada) — corpo de texto.
 * Mono: JetBrains Mono — labels uppercase com tracking-wide.
 */
const leagueSpartan = localFont({
  src: "./fonts/LeagueSpartan-Bold.woff2",
  variable: "--font-league-spartan",
  display: "swap",
  weight: "700",
  style: "normal",
});

const hiragino = localFont({
  src: "./fonts/HiraginoMaruGothicProN-W4.woff2",
  variable: "--font-hiragino",
  display: "swap",
  weight: "400",
  style: "normal",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#06172f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.professor.fullName }],
  creator: siteConfig.professor.fullName,
  publisher: siteConfig.name,
  keywords: [
    "Direito Penal",
    "Processo Penal",
    "Direito Penal Militar",
    "MPDFT",
    "Promotor de Justiça",
    "concurso jurídico",
    "Flávio Milhomem",
    "Edição Lançamento",
  ],
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // images: gerada dinamicamente por `app/opengraph-image.tsx`
    // (file-based wins; não declarar aqui evita drift entre PNG e
    // ImageResponse).
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // images: idem — `app/twitter-image.tsx` ou herda do OG.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.locale}
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        leagueSpartan.variable,
        hiragino.variable,
        jetbrainsMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="bg-carbon text-paper flex min-h-full flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
        <AnalyticsProviders />
        <WebVitalsReporter />
      </body>
      {siteConfig.tracking.gtmId ? (
        <GoogleTagManager gtmId={siteConfig.tracking.gtmId} />
      ) : null}
    </html>
  );
}
