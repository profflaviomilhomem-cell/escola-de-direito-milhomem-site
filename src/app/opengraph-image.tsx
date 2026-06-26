import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const navy = "#030024";
  const mostarda = "#f1bb41";
  const creme = "#e0e0e0";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: navy,
        padding: "72px 88px",
        color: creme,
        backgroundImage: `radial-gradient(ellipse at 80% 20%, rgba(241, 187, 65,0.12) 0%, rgba(241, 187, 65,0) 60%)`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 18,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: mostarda,
          fontWeight: 600,
        }}
      >
        <span>Escola Flávio Milhomem</span>
        <span style={{ color: "rgba(224, 224, 224,0.55)" }}>
          MPDFT · Brasília
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 116,
            lineHeight: 1,
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          <span>A Escola de</span>
          <span style={{ color: mostarda }}>direito criminal</span>
        </div>

        <div
          style={{
            marginTop: 40,
            width: 96,
            height: 3,
            background: mostarda,
          }}
        />

        <span
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.35,
            fontStyle: "italic",
            color: "rgba(224, 224, 224,0.88)",
            maxWidth: 940,
          }}
        >
          {`${siteConfig.tagline} — com método, leitura de fontes e linguagem de tribunal.`}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 16,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(224, 224, 224,0.6)",
        }}
      >
        <span>Edição Lançamento · 2026</span>
        <span style={{ color: mostarda }}>professorflaviomilhomem.com.br</span>
      </div>
    </div>,
    size,
  );
}
