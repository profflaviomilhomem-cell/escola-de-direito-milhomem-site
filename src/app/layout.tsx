import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Fraunces,
  JetBrains_Mono,
} from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { Toaster } from "sonner";

import { siteConfig } from "@/config/site";

import "./globals.css";

/**
 * Fontes via next/font (Seção 3.13 do guia — sem layout shift).
 *
 * Família display (h1, h2, h3, .serif): Cormorant Garamond, com itálicos
 * que protagonizam o tom editorial. Body: Fraunces (variable, opsz).
 * Mono: JetBrains Mono — labels uppercase com tracking-wide.
 */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#0b0a09",
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
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
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
      className={`${cormorant.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-carbon text-paper flex min-h-full flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
      {siteConfig.tracking.gtmId ? (
        <GoogleTagManager gtmId={siteConfig.tracking.gtmId} />
      ) : null}
    </html>
  );
}
